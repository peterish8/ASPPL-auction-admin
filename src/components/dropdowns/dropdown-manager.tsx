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
import { Pencil, Trash2, Plus, Save, X, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'

interface DropdownManagerProps {
  initialOptions: DropdownOption[]
}

const CATEGORIES = [
  { value: 'details', label: 'Details' },
  { value: 'type', label: 'Type' },
  { value: 'depot', label: 'Depot' },
] as const

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

  const filteredOptions = options
    .filter(opt => opt.category === activeTab)
    .sort((a, b) => a.order - b.order)

  const refreshOptions = async () => {
    const { data } = await supabase
      .from('dropdowns')
      .select('*')
      .order('order', { ascending: true })
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
      const maxOrder = Math.max(0, ...filteredOptions.map(o => o.order))
      const { error } = await supabase
        .from('dropdowns')
        .insert({
          category: activeTab,
          label: newLabel.trim(),
          order: maxOrder + 1,
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
      const { error } = await supabase
        .from('dropdowns')
        .delete()
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

  const moveOption = async (option: DropdownOption, direction: 'up' | 'down') => {
    const currentIndex = filteredOptions.findIndex(o => o.id === option.id)
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (swapIndex < 0 || swapIndex >= filteredOptions.length) return

    const swapOption = filteredOptions[swapIndex]
    setLoading(true)

    try {
      await Promise.all([
        supabase.from('dropdowns').update({ order: swapOption.order }).eq('id', option.id),
        supabase.from('dropdowns').update({ order: option.order }).eq('id', swapOption.id),
      ])
      refreshOptions()
    } catch (error) {
      toast.error('Failed to reorder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dropdown Manager</h1>
        <p className="text-zinc-400 mt-1">Manage dropdown options for the user form</p>
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
                    filteredOptions.map((option, index) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                      >
                        <GripVertical className="h-5 w-5 text-zinc-600" />
                        
                        {editingId === option.id ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-white font-medium">{option.label}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveOption(option, 'up')}
                                disabled={index === 0}
                                className="hover:bg-zinc-800 h-8 w-8"
                              >
                                <ArrowUp className="h-4 w-4 text-zinc-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => moveOption(option, 'down')}
                                disabled={index === filteredOptions.length - 1}
                                className="hover:bg-zinc-800 h-8 w-8"
                              >
                                <ArrowDown className="h-4 w-4 text-zinc-400" />
                              </Button>
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
                      </div>
                    ))
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
