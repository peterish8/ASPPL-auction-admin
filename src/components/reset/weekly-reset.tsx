'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trade } from '@/lib/types'
import { formatDate, formatDateForInput } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Plus,
  Archive,
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

interface WeeklyResetProps {
  activeTrade: Trade | null
  trades: Trade[]
  submissionCount: number
  lastTradeNumber: string
}

export function WeeklyReset({ 
  activeTrade, 
  trades, 
  submissionCount,
  lastTradeNumber
}: WeeklyResetProps) {
  const [loading, setLoading] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [newTradeData, setNewTradeData] = useState({
    trade_number: '',
    trade_date: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // Next week
  })
  
  const router = useRouter()
  const supabase = createClient()

  // Close current active trade
  const handleCloseTrade = async () => {
    if (!activeTrade) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('trades')
        .update({ is_active: false })
        .eq('id', activeTrade.id)

      if (error) throw error
      toast.success(`Trade ${activeTrade.trade_number} has been closed`)
      setCloseDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to close trade')
    } finally {
      setLoading(false)
    }
  }

  // Create next trade
  const handleCreateNextTrade = async () => {
    if (!newTradeData.trade_number.trim() || !newTradeData.trade_date) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase
        .from('trades')
        .insert({
          trade_number: newTradeData.trade_number.trim(),
          trade_date: newTradeData.trade_date,
          is_active: true,
        })

      if (error) throw error
      toast.success(`Trade ${newTradeData.trade_number} created and set as active`)
      setCreateDialogOpen(false)
      setNewTradeData({
        trade_number: '',
        trade_date: formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create trade')
    } finally {
      setLoading(false)
    }
  }

  // Full weekly reset: Close current trade + Create new one
  const handleWeeklyReset = async () => {
    if (!newTradeData.trade_number.trim()) {
      toast.error('Please enter a trade number')
      return
    }
    setLoading(true)

    try {
      // Step 1: Close current active trade (if exists)
      if (activeTrade) {
        const { error: closeError } = await supabase
          .from('trades')
          .update({ is_active: false })
          .eq('id', activeTrade.id)
        if (closeError) throw closeError
      }

      // Step 2: Create new trade
      const { error: createError } = await supabase
        .from('trades')
        .insert({
          trade_number: newTradeData.trade_number.trim(),
          trade_date: newTradeData.trade_date,
          is_active: true,
        })
      if (createError) throw createError

      toast.success('Weekly reset completed successfully!')
      setResetDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete weekly reset')
    } finally {
      setLoading(false)
    }
  }

  const inactiveTrades = trades.filter(t => !t.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Weekly Reset</h1>
        <p className="text-zinc-400 mt-1">Close current trade and prepare for the next week</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Active Trade</CardTitle>
            <FileText className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            {activeTrade ? (
              <div className="text-2xl font-bold text-white">{activeTrade.trade_number}</div>
            ) : (
              <div className="text-xl text-zinc-500">None</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Current Submissions</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{submissionCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Trades</CardTitle>
            <Archive className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{trades.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Inactive Trades</CardTitle>
            <CheckCircle className="h-5 w-5 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inactiveTrades}</div>
          </CardContent>
        </Card>
      </div>

      {/* Current Trade Status */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Current Trade Status
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Review the current active trade before proceeding with reset
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTrade ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg bg-zinc-800/50">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white">
                      Trade {activeTrade.trade_number}
                    </span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      ACTIVE
                    </Badge>
                  </div>
                  <p className="text-zinc-400 mt-1">
                    Trade Date: {formatDate(activeTrade.trade_date)}
                  </p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Created: {formatDate(activeTrade.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Submissions</p>
                    <p className="text-xl font-bold text-blue-400">{submissionCount}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <p className="text-yellow-300">
                No active trade found. Create a new trade to start accepting submissions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Actions */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Reset Actions
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Choose an action to manage your weekly trade cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Close Current Trade */}
            <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50 space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <h3 className="font-medium text-white">Close Current Trade</h3>
              </div>
              <p className="text-sm text-zinc-400">
                Mark the current active trade as inactive. This will stop accepting new submissions for this trade.
              </p>
              <Button
                onClick={() => setCloseDialogOpen(true)}
                disabled={!activeTrade}
                className="w-full bg-red-600/80 hover:bg-red-600 text-white"
              >
                Close Trade
              </Button>
            </div>

            {/* Create Next Trade */}
            <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/50 space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-400" />
                <h3 className="font-medium text-white">Create Next Trade</h3>
              </div>
              <p className="text-sm text-zinc-400">
                Create a new trade and set it as active. This will be the new trade for submissions.
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="w-full bg-green-600/80 hover:bg-green-600 text-white"
              >
                Create Trade
              </Button>
            </div>

            {/* Weekly Reset */}
            <div className="p-4 rounded-lg bg-linear-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-blue-400" />
                <h3 className="font-medium text-white">Full Weekly Reset</h3>
              </div>
              <p className="text-sm text-zinc-400">
                Close current trade and create a new one in one step. Recommended for weekly transitions.
              </p>
              <Button
                onClick={() => setResetDialogOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Weekly Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Close Trade Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Close Trade {activeTrade?.trade_number}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will mark the current trade as inactive. New submissions will not be accepted for this trade.
              This action can be undone by editing the trade status.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-zinc-800/50 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Trade Number:</span>
                <span className="text-white font-medium">{activeTrade?.trade_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Trade Date:</span>
                <span className="text-white">{activeTrade && formatDate(activeTrade.trade_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Submissions:</span>
                <span className="text-blue-400 font-medium">{submissionCount}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCloseTrade} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Closing...' : 'Close Trade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Trade Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-400" />
              Create New Trade
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Create a new trade that will be set as active immediately.
              {lastTradeNumber && (
                <span className="block mt-1 text-zinc-500">
                  Last trade: {lastTradeNumber}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trade_number">Trade Number</Label>
              <Input
                id="trade_number"
                type="text"
                placeholder="e.g., T001, 2024-W1"
                value={newTradeData.trade_number}
                onChange={(e) => setNewTradeData({ 
                  ...newTradeData, 
                  trade_number: e.target.value 
                })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trade_date">Trade Date</Label>
              <Input
                id="trade_date"
                type="date"
                value={newTradeData.trade_date}
                onChange={(e) => setNewTradeData({ 
                  ...newTradeData, 
                  trade_date: e.target.value 
                })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNextTrade} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Creating...' : 'Create Trade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weekly Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-blue-400" />
              Weekly Reset
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              This will close the current trade and create a new active trade.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {activeTrade && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-300">
                  <span className="font-medium">Trade {activeTrade.trade_number}</span> will be closed
                </p>
              </div>
            )}
            {newTradeData.trade_number && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-sm text-green-300">
                  <span className="font-medium">Trade {newTradeData.trade_number}</span> will be created and set as active
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reset_trade_number">New Trade Number</Label>
              <Input
                id="reset_trade_number"
                type="text"
                placeholder="e.g., T001, 2024-W1"
                value={newTradeData.trade_number}
                onChange={(e) => setNewTradeData({ 
                  ...newTradeData, 
                  trade_number: e.target.value 
                })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset_trade_date">New Trade Date</Label>
              <Input
                id="reset_trade_date"
                type="date"
                value={newTradeData.trade_date}
                onChange={(e) => setNewTradeData({ 
                  ...newTradeData, 
                  trade_date: e.target.value 
                })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWeeklyReset} 
              disabled={loading || !newTradeData.trade_number.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Processing...' : 'Confirm Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
