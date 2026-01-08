'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trade, TradeFormData } from '@/lib/types'
import { formatDateForInput } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { toast } from 'sonner'

interface TradeFormProps {
  trade?: Trade | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TradeForm({ trade, open, onOpenChange, onSuccess }: TradeFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TradeFormData>({
    trade_number: trade?.trade_number || '',
    trade_date: trade?.trade_date ? formatDateForInput(trade.trade_date) : formatDateForInput(new Date()),
    is_active: trade?.is_active ?? false,
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // If setting to active, deactivate any existing active trade first
      if (formData.is_active) {
        await supabase
          .from('trades')
          .update({ is_active: false })
          .eq('is_active', true)
          .neq('id', trade?.id || '')
      }

      let activeTradeId = trade?.id

      if (trade) {
        // Update existing trade
        const { error } = await supabase
          .from('trades')
          .update(formData)
          .eq('id', trade.id)

        if (error) throw error
        toast.success('Trade updated successfully')
      } else {
        // Create new trade
        const { data, error } = await supabase
          .from('trades')
          .insert(formData)
          .select()
          .single()

        if (error) throw error
        activeTradeId = data.id
        toast.success('Trade created successfully')
      }

      // If active, sync pooling schedule to this trade
      if (formData.is_active && activeTradeId) {
        const { error: syncError } = await supabase
          .from('pooling_schedule')
          .update({ trade_id: activeTradeId })
          .not('id', 'is', null) // Apply to all rows
        
        if (syncError) {
          console.error('Failed to sync pooling schedule:', syncError)
          toast.error('Trade saved but failed to sync pooling schedule')
        } else {
          toast.success('Pooling schedule synced to new trade')
        }
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>{trade ? 'Edit Trade' : 'Create New Trade'}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {trade ? 'Update trade details below.' : 'Fill in the trade details below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trade_number">Trade Number</Label>
            <Input
              id="trade_number"
              type="text"
              placeholder="e.g., T001, 2024-W1"
              value={formData.trade_number}
              onChange={(e) => setFormData({ ...formData, trade_number: e.target.value })}
              className="bg-zinc-800 border-zinc-700"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trade_date">Trade Date</Label>
            <Input
              id="trade_date"
              type="date"
              value={formData.trade_date}
              onChange={(e) => setFormData({ ...formData, trade_date: e.target.value })}
              className="bg-zinc-800 border-zinc-700"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="is_active">Status</Label>
            <Select
              value={formData.is_active ? 'active' : 'inactive'}
              onValueChange={(value) => 
                setFormData({ ...formData, is_active: value === 'active' })
              }
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            {formData.is_active && (
              <p className="text-sm text-yellow-400">
                Note: Setting to Active will deactivate any existing active trade.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Saving...' : trade ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
