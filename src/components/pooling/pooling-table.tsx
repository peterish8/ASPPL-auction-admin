'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PoolingSchedule, Trade } from '@/lib/types'
import { formatDate, formatDateForInput } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface PoolingTableProps {
  initialSchedule: PoolingSchedule[]
  trades: Trade[]
}

export function PoolingTable({ initialSchedule, trades }: PoolingTableProps) {
  const [schedule, setSchedule] = useState<PoolingSchedule[]>(initialSchedule)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PoolingSchedule | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState({ location: '', date: '' })
  const [newItem, setNewItem] = useState({ location: '', date: '', trade_id: '' })
  const [showAddRow, setShowAddRow] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const activeTrade = trades.find(t => t.status === 'active')

  const refreshSchedule = async () => {
    const { data } = await supabase
      .from('pooling_schedule')
      .select('*')
      .order('date', { ascending: true })
    if (data) setSchedule(data)
    router.refresh()
  }

  const handleAdd = async () => {
    if (!newItem.location || !newItem.date) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase
        .from('pooling_schedule')
        .insert({
          location: newItem.location,
          date: newItem.date,
          trade_id: newItem.trade_id || activeTrade?.id || null,
        })

      if (error) throw error
      toast.success('Location added successfully')
      setNewItem({ location: '', date: '', trade_id: '' })
      setShowAddRow(false)
      refreshSchedule()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: PoolingSchedule) => {
    setEditingId(item.id)
    setEditData({ 
      location: item.location, 
      date: formatDateForInput(item.date) 
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({ location: '', date: '' })
  }

  const saveEdit = async (id: string) => {
    if (!editData.location || !editData.date) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase
        .from('pooling_schedule')
        .update({ location: editData.location, date: editData.date })
        .eq('id', id)

      if (error) throw error
      toast.success('Updated successfully')
      cancelEdit()
      refreshSchedule()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (item: PoolingSchedule) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedItem) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('pooling_schedule')
        .delete()
        .eq('id', selectedItem.id)

      if (error) throw error
      toast.success('Location deleted successfully')
      refreshSchedule()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setLoading(false)
      setDeleteOpen(false)
      setSelectedItem(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Pooling Schedule</h1>
          <p className="text-zinc-400 mt-1">Manage pooling locations and dates</p>
        </div>
        <Button 
          onClick={() => setShowAddRow(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={showAddRow}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="text-zinc-400">Location</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Add new row */}
            {showAddRow && (
              <TableRow className="border-zinc-800 bg-zinc-800/30">
                <TableCell>
                  <Input
                    placeholder="Location name"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    value={newItem.date}
                    onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="icon"
                      onClick={handleAdd}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setShowAddRow(false); setNewItem({ location: '', date: '', trade_id: '' }); }}
                      className="hover:bg-zinc-800"
                    >
                      <X className="h-4 w-4 text-zinc-400" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {schedule.length === 0 && !showAddRow ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-zinc-400 py-8">
                  No pooling locations found. Add your first location.
                </TableCell>
              </TableRow>
            ) : (
              schedule.map((item) => (
                <TableRow key={item.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    ) : (
                      <span className="font-medium text-white">{item.location}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === item.id ? (
                      <Input
                        type="date"
                        value={editData.date}
                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                        className="bg-zinc-800 border-zinc-700"
                      />
                    ) : (
                      <span className="text-zinc-300">{formatDate(item.date)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === item.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          onClick={() => saveEdit(item.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEdit}
                          className="hover:bg-zinc-800"
                        >
                          <X className="h-4 w-4 text-zinc-400" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEdit(item)}
                          className="hover:bg-zinc-800"
                        >
                          <Pencil className="h-4 w-4 text-zinc-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item)}
                          className="hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Location</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete &quot;{selectedItem?.location}&quot;? This action cannot be undone.
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
