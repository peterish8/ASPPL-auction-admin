'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DropdownOption } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Pencil, Trash2, Plus, Save, X, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

interface DropdownManagerProps {
  initialOptions: DropdownOption[]
}

const CATEGORIES = [
  { value: 'details', label: 'Details' },
  { value: 'type', label: 'Type' },
  { value: 'depot', label: 'Depot' },
] as const
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

function SortableItem({
  id,
  children
}: {
  id: string
  children: React.ReactNode
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
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
        isDragging ? "bg-zinc-800/80 border border-blue-500" : "bg-zinc-800/30 hover:bg-zinc-800/50"
      }`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-move p-1 hover:bg-zinc-800 rounded text-zinc-600 hover:text-zinc-400 touch-none"
        style={{ touchAction: 'none' }}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      {children}
    </div>
  )
}

export function DropdownManager({ initialOptions }: DropdownManagerProps) {
  const [options, setOptions] = useState<DropdownOption[]>(initialOptions)
  const [activeTab, setActiveTab] = useState<'details' | 'type' | 'depot'>('details')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filteredOptions = options    .filter(opt => opt.category === activeTab && opt.is_active)
    .sort((a, b) => a.order_index - b.order_index)

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    const oldIndex = filteredOptions.findIndex(item => item.id === active.id)
    const newIndex = filteredOptions.findIndex(item => item.id === over.id)
    
    if (oldIndex === -1 || newIndex === -1) return

    // Optimistic update
    const newFiltered = arrayMove(filteredOptions, oldIndex, newIndex)
    
    // Update order_indexes
    const updates = newFiltered.map((item, index) => ({
      ...item,
      order_index: index
    }))

    // Update local state
    setOptions(prev => {
      const otherOptions = prev.filter(p => p.category !== activeTab || !p.is_active)
      return [...otherOptions, ...updates]
    })

    // Persist to DB
    try {
      const { error } = await supabase
        .from('dropdowns')
        .upsert(
          updates.map(item => ({
            id: item.id,
            category: item.category,
            label: item.label,
            is_active: item.is_active,
            order_index: item.order_index
          }))
        )

      if (error) throw error
    } catch (error) {
      toast.error('Failed to update order')
      refreshOptions() // Revert on error
    }
  }

  const refreshOptions = async () => {
    const { data } = await supabase
      .from('dropdowns')
      .select('*')
      .order('order_index', { ascending: true })
    if (data) setOptions(data)
    router.refresh()
  }

  const handleAdd = async () => {
    if (!newLabel.trim()) {
      toast.error('Please enter a label')
      return
    }
    setLoading(true)

    try {
      const maxOrder = Math.max(0, ...filteredOptions.map(o => o.order_index))
      const { error } = await supabase
        .from('dropdowns')
        .insert({
          category: activeTab,
          label: newLabel.trim(),
          order_index: maxOrder + 1,
          is_active: true,
        })

      if (error) throw error
      toast.success('Option added successfully')
      setNewLabel('')
      setShowAdd(false)
      refreshOptions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (option: DropdownOption) => {
    setEditingId(option.id)
    setEditLabel(option.label)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditLabel('')
  }

  const saveEdit = async (id: string) => {
    if (!editLabel.trim()) {
      toast.error('Please enter a label')
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase
        .from('dropdowns')
        .update({ label: editLabel.trim() })
        .eq('id', id)

      if (error) throw error
      toast.success('Updated successfully')
      cancelEdit()
      refreshOptions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (option: DropdownOption) => {
    setSelectedOption(option)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedOption) return
    setLoading(true)

    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('dropdowns')
        .update({ is_active: false })
        .eq('id', selectedOption.id)

      if (error) throw error
      toast.success('Option deleted successfully')
      refreshOptions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setLoading(false)
      setDeleteOpen(false)
      setSelectedOption(null)
    }
  }



  return (
    <div className="space-y-6">
      <div className="mr-14 lg:mr-0">
        <h1 id="dropdowns-title" className="text-3xl font-bold text-white">Dropdown Manager</h1>
        <p className="text-zinc-400 mt-1">Manage dropdown options</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="bg-zinc-800/50 border border-zinc-700">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="mt-4">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">{cat.label} Options</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Manage options for the {cat.label.toLowerCase()} dropdown
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowAdd(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={showAdd}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Add new option */}
                  {showAdd && activeTab === cat.value && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <GripVertical className="h-5 w-5 text-zinc-600" />
                      <Input
                        placeholder="Enter option label"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="flex-1 bg-zinc-800 border-zinc-700"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      />
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
                        onClick={() => { setShowAdd(false); setNewLabel(''); }}
                        className="hover:bg-zinc-800"
                      >
                        <X className="h-4 w-4 text-zinc-400" />
                      </Button>
                    </div>
                  )}

                  {/* Options list */}
                  {filteredOptions.length === 0 && !showAdd ? (
                    <div className="text-center text-zinc-400 py-8">
                      No options found. Add your first option.
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={filteredOptions.map(o => o.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filteredOptions.map((option) => (
                          <SortableItem key={option.id} id={option.id}>
                            {editingId === option.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  value={editLabel}
                                  onChange={(e) => setEditLabel(e.target.value)}
                                  className="flex-1 bg-zinc-800 border-zinc-700"
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(option.id)}
                                />
                                <Button
                                  size="icon"
                                  onClick={() => saveEdit(option.id)}
                                  disabled={loading}
                                  className="bg-green-600 hover:bg-green-700 h-8 w-8"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={cancelEdit}
                                  className="hover:bg-zinc-800 h-8 w-8"
                                >
                                  <X className="h-4 w-4 text-zinc-400" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 text-white font-medium">{option.label}</span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEdit(option)}
                                    className="hover:bg-zinc-800 h-8 w-8"
                                  >
                                    <Pencil className="h-4 w-4 text-zinc-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(option)}
                                    className="hover:bg-red-900/20 h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </SortableItem>
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Option</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete &quot;{selectedOption?.label}&quot;? This action cannot be undone.
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
