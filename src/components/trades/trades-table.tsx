'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trade } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TradeForm } from './trade-form'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface TradesTableProps {
  initialTrades: Trade[]
}

export function TradesTable({ initialTrades }: TradesTableProps) {
  const [trades, setTrades] = useState<Trade[]>(initialTrades)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const refreshTrades = async () => {
    const { data } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setTrades(data)
    router.refresh()
  }

  const handleEdit = (trade: Trade) => {
    setSelectedTrade(trade)
    setFormOpen(true)
  }

  const handleDelete = (trade: Trade) => {
    setSelectedTrade(trade)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedTrade) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', selectedTrade.id)

      if (error) throw error
      toast.success('Trade deleted successfully')
      refreshTrades()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setLoading(false)
      setDeleteOpen(false)
      setSelectedTrade(null)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          ACTIVE
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
        INACTIVE
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mr-14 lg:mr-0">
        <div>
          <h1 id="trades-title" className="text-3xl font-bold text-white">Trades</h1>
          <p className="text-zinc-400 mt-1">Manage weekly trades</p>
        </div>
        <Button 
          onClick={() => { setSelectedTrade(null); setFormOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Trade
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="text-zinc-400">Trade Number</TableHead>
              <TableHead className="text-zinc-400">Trade Date</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Created</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-400 py-8">
                  No trades found. Create your first trade.
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => (
                <TableRow key={trade.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell className="font-medium text-white">
                    {trade.trade_number}
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {formatDate(trade.trade_date)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(trade.is_active)}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {formatDate(trade.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(trade)}
                        className="hover:bg-zinc-800"
                      >
                        <Pencil className="h-4 w-4 text-zinc-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(trade)}
                        className="hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Trade Form Dialog */}
      <TradeForm
        trade={selectedTrade}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={refreshTrades}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Trade</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete Trade {selectedTrade?.trade_number}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
