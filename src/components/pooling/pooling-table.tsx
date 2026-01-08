'use client'

import { useState, useEffect } from 'react'
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
import { Pencil, Trash2, Plus, Save, X, AlertTriangle, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Row Component
function SortableRow({ 
  children, 
  id 
}: { 
  children: React.ReactNode 
  id: string 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      className={isDragging ? "bg-zinc-800/80 border-blue-500" : "border-zinc-800 hover:bg-zinc-900/50"}
    >
      <TableCell className="w-[40px] p-0 pl-4">
        <button 
          {...attributes} 
          {...listeners}
          className="cursor-move p-2 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-200 transition-colors touch-none"
          type="button"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  )
}

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
  const [editData, setEditData] = useState({ location: '', pooling_date: '' })
  const [newItem, setNewItem] = useState({ location: '', pooling_date: '', trade_id: '' })
  const [showAddRow, setShowAddRow] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const activeTrade = trades.find(t => t.is_active)

  // Auto-sync all pooling schedules to active trade
  useEffect(() => {
    const syncToActiveTrade = async () => {
      if (!activeTrade) return
      
      // Find items not linked to active trade
      const itemsToSync = schedule.filter(item => item.trade_id !== activeTrade.id)
      
      if (itemsToSync.length === 0) return
      
      // Update all to active trade
      const { error } = await supabase
        .from('pooling_schedule')
        .update({ trade_id: activeTrade.id })
        .neq('trade_id', activeTrade.id)

      if (!error) {
        toast.success(`Synced ${itemsToSync.length} locations to ${activeTrade.trade_number}`)
        refreshSchedule()
      }
    }
    
    syncToActiveTrade()
  }, [activeTrade?.id]) // Run when active trade changes

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const refreshSchedule = async () => {
    const { data } = await supabase
      .from('pooling_schedule')
      .select('*')
      .order('order_index', { ascending: true })
      .order('pooling_date', { ascending: true })
    if (data) setSchedule(data)
    router.refresh()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setSchedule((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Update order in DB
        // We update all items with their new index
        const updates = newItems.map((item, index) => ({
          id: item.id,
          order_index: index,
          location: item.location,    // Include required fields if needed by RLS or Types, though ID + order_index implies update
          pooling_date: item.pooling_date,
          trade_id: item.trade_id,
        }))

        // Fire and forget (or handle error quietly)
        supabase
          .from('pooling_schedule')
          .upsert(updates)
          .then(({ error }) => {
            if (error) toast.error('Failed to save order')
          })

        return newItems
      })
    }
  }

  const handleAdd = async () => {
    if (!newItem.location || !newItem.pooling_date) {
      toast.error('Please fill in all fields')
      return
    }
    
    const tradeId = newItem.trade_id || activeTrade?.id
    
    if (!tradeId) {
      toast.error('No trade selected. Please create an active trade first or select a trade.')
      return
    }
    
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('pooling_schedule')
        .insert({
          location: newItem.location,
          pooling_date: newItem.pooling_date,
          trade_id: tradeId,
        })
        .select()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }
      
      console.log('Inserted:', data)
      toast.success('Location added successfully')
      setNewItem({ location: '', pooling_date: '', trade_id: '' })
      setShowAddRow(false)
      refreshSchedule()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add location')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (item: PoolingSchedule) => {
    setEditingId(item.id)
    setEditData({ 
      location: item.location, 
      pooling_date: formatDateForInput(item.pooling_date) 
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({ location: '', pooling_date: '' })
  }

  const saveEdit = async (id: string) => {
    if (!editData.location || !editData.pooling_date) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase
        .from('pooling_schedule')
        .update({ location: editData.location, pooling_date: editData.pooling_date })
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
      <div>
        <h1 className="text-3xl font-bold text-white">Pooling Schedule</h1>
        <div className="flex justify-between items-center mt-3">
          <p className="text-zinc-400">Manage pooling locations & dates</p>
          <Button 
            onClick={() => setShowAddRow(true)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={showAddRow}
          >
            <Plus className="h-4 w-4 mr-1" />
            Location
          </Button>
        </div>
      </div>

      {/* Warning if no active trade */}
      {!activeTrade && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <p className="text-yellow-300">
            No active trade found. Please create and activate a trade first, or select a trade when adding locations.
          </p>
        </div>
      )}

      {/* Active trade info */}
      {activeTrade && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-green-300 text-sm">
            Active Trade: <span className="font-medium">{activeTrade.trade_number}</span> ({formatDate(activeTrade.trade_date)})
          </p>
        </div>
      )}

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
      <div className="rounded-lg border border-zinc-800 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="text-zinc-400">Location</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-400">Trade</TableHead>
              <TableHead className="text-zinc-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Add new row */}
            {showAddRow && (
              <TableRow className="border-zinc-800 bg-zinc-800/30">
                <TableCell></TableCell>
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
                    value={newItem.pooling_date}
                    onChange={(e) => setNewItem({ ...newItem, pooling_date: e.target.value })}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={newItem.trade_id || activeTrade?.id || ''}
                    onValueChange={(v) => setNewItem({ ...newItem, trade_id: v })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Select trade" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {trades.map((trade) => (
                        <SelectItem key={trade.id} value={trade.id}>
                          {trade.trade_number} {trade.is_active && '(Active)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      onClick={() => { setShowAddRow(false); setNewItem({ location: '', pooling_date: '', trade_id: '' }); }}
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
                <TableCell colSpan={5} className="text-center text-zinc-400 py-8">
                  No pooling locations found. Add your first location.
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext 
                items={schedule.map(s => s.id)} 
                strategy={verticalListSortingStrategy}
              >
              {schedule.map((item) => {
                const itemTrade = trades.find(t => t.id === item.trade_id)
                return (
                  <SortableRow key={item.id} id={item.id}>
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
                          value={editData.pooling_date}
                          onChange={(e) => setEditData({ ...editData, pooling_date: e.target.value })}
                          className="bg-zinc-800 border-zinc-700"
                        />
                      ) : (
                        <span className="text-zinc-300">{formatDate(item.pooling_date)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-zinc-400 text-sm">
                        {itemTrade?.trade_number || 'Unknown'}
                      </span>
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
                  </SortableRow>
                )
              })}
              </SortableContext>
            )}
          </TableBody>
        </Table>
      </div>
      </DndContext>

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
