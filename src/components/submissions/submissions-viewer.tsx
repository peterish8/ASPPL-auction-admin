'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Submission, Trade, DropdownOption } from '@/lib/types'
import { formatDateTime, exportToCSV, exportToJSON, copyToClipboard } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Download, 
  FileJson, 
  Copy, 
  Search, 
  Filter, 
  RefreshCw,
  X,
  Eye,
  FileSpreadsheet,
  ClipboardCheck
} from 'lucide-react'
import { toast } from 'sonner'

interface SubmissionsViewerProps {
  initialSubmissions: Submission[]
  trades: Trade[]
  depots: DropdownOption[]
  types: DropdownOption[]
}

export function SubmissionsViewer({ 
  initialSubmissions, 
  trades, 
  depots, 
  types 
}: SubmissionsViewerProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    trade_id: 'all',
    depot: 'all',
    type: 'all',
  })
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const refreshSubmissions = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .order('submitted_at', { ascending: false })
      if (data) setSubmissions(data)
      router.refresh()
      toast.success('Submissions refreshed')
    } catch {
      toast.error('Failed to refresh')
    } finally {
      setLoading(false)
    }
  }

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          sub.name.toLowerCase().includes(query) ||
          sub.phone.toLowerCase().includes(query) ||
          sub.details.toLowerCase().includes(query) ||
          sub.depot.toLowerCase().includes(query) ||
          sub.type.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Trade filter
      if (filters.trade_id !== 'all' && sub.trade_id !== filters.trade_id) {
        return false
      }

      // Depot filter
      if (filters.depot !== 'all' && sub.depot !== filters.depot) {
        return false
      }

      // Type filter
      if (filters.type !== 'all' && sub.type !== filters.type) {
        return false
      }

      return true
    })
  }, [submissions, searchQuery, filters])

  const clearFilters = () => {
    setFilters({ trade_id: 'all', depot: 'all', type: 'all' })
    setSearchQuery('')
  }

  const hasActiveFilters = 
    filters.trade_id !== 'all' || 
    filters.depot !== 'all' || 
    filters.type !== 'all' || 
    searchQuery !== ''

  // Export functions
  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No data to export')
      return
    }
    const exportData = filteredSubmissions.map(sub => ({
      Name: sub.name,
      Phone: sub.phone,
      Details: sub.details,
      Weight: sub.weight,
      Type: sub.type,
      Depot: sub.depot,
      'Trade Number': sub.trade_number || 'N/A',
      'Submitted At': formatDateTime(sub.submitted_at),
    }))
    exportToCSV(exportData, `submissions_${new Date().toISOString().split('T')[0]}`)
    toast.success('Exported to CSV')
  }

  const handleExportJSON = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No data to export')
      return
    }
    exportToJSON(filteredSubmissions, `submissions_${new Date().toISOString().split('T')[0]}`)
    toast.success('Exported to JSON')
  }

  const handleCopyToClipboard = async () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No data to copy')
      return
    }
    const text = filteredSubmissions.map(sub => 
      `${sub.name} | ${sub.phone} | ${sub.details} | ${sub.weight}kg | ${sub.type} | ${sub.depot}`
    ).join('\n')
    const success = await copyToClipboard(text)
    if (success) {
      toast.success('Copied to clipboard')
    } else {
      toast.error('Failed to copy')
    }
  }

  const viewSubmission = (sub: Submission) => {
    setSelectedSubmission(sub)
    setViewOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Submissions</h1>
          <p className="text-zinc-400 mt-1">View and export all trade submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSubmissions}
            disabled={loading}
            className="border-zinc-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-zinc-400" />
              <CardTitle className="text-white text-lg">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <CardDescription className="text-zinc-400">
            Filter submissions by trade, depot, or type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-800 border-zinc-700"
              />
            </div>

            {/* Trade Filter */}
            <Select
              value={filters.trade_id}
              onValueChange={(v) => setFilters({ ...filters, trade_id: v })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Filter by Trade" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Trades</SelectItem>
                {trades.map((trade) => (
                  <SelectItem key={trade.id} value={trade.id}>
                    Trade #{trade.trade_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Depot Filter */}
            <Select
              value={filters.depot}
              onValueChange={(v) => setFilters({ ...filters, depot: v })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Filter by Depot" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Depots</SelectItem>
                {depots.map((depot) => (
                  <SelectItem key={depot.id} value={depot.label}>
                    {depot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
              value={filters.type}
              onValueChange={(v) => setFilters({ ...filters, type: v })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type.id} value={type.label}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions & Results Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-zinc-400">
          Showing <span className="font-medium text-white">{filteredSubmissions.length}</span> of{' '}
          <span className="font-medium text-white">{submissions.length}</span> submissions
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-zinc-700 hover:bg-green-900/20 hover:border-green-700 hover:text-green-400"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="border-zinc-700 hover:bg-blue-900/20 hover:border-blue-700 hover:text-blue-400"
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyToClipboard}
            className="border-zinc-700 hover:bg-purple-900/20 hover:border-purple-700 hover:text-purple-400"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </Button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Phone</TableHead>
                <TableHead className="text-zinc-400">Details</TableHead>
                <TableHead className="text-zinc-400">Weight</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Depot</TableHead>
                <TableHead className="text-zinc-400">Trade #</TableHead>
                <TableHead className="text-zinc-400">Submitted</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-zinc-400 py-12">
                    {hasActiveFilters 
                      ? 'No submissions match your filters.' 
                      : 'No submissions found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((sub) => (
                  <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-white">{sub.name}</TableCell>
                    <TableCell className="text-zinc-300">{sub.phone}</TableCell>
                    <TableCell className="text-zinc-300 max-w-[200px] truncate" title={sub.details}>
                      {sub.details}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      <span className="font-medium text-blue-400">{sub.weight}</span> kg
                    </TableCell>
                    <TableCell className="text-zinc-300">{sub.type}</TableCell>
                    <TableCell className="text-zinc-300">{sub.depot}</TableCell>
                    <TableCell className="text-zinc-400">
                      {sub.trade_number ? `#${sub.trade_number}` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {formatDateTime(sub.submitted_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewSubmission(sub)}
                        className="hover:bg-zinc-800"
                      >
                        <Eye className="h-4 w-4 text-zinc-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Submission Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Full details of the selected submission
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Name</p>
                  <p className="text-white font-medium mt-1">{selectedSubmission.name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Phone</p>
                  <p className="text-white font-medium mt-1">{selectedSubmission.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Weight</p>
                  <p className="text-white font-medium mt-1">{selectedSubmission.weight} kg</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Type</p>
                  <p className="text-white font-medium mt-1">{selectedSubmission.type}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Depot</p>
                  <p className="text-white font-medium mt-1">{selectedSubmission.depot}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Trade #</p>
                  <p className="text-white font-medium mt-1">
                    {selectedSubmission.trade_number ? `#${selectedSubmission.trade_number}` : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Details</p>
                <p className="text-white mt-1 p-3 bg-zinc-800/50 rounded-lg">
                  {selectedSubmission.details}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Submitted At</p>
                <p className="text-zinc-400 mt-1">{formatDateTime(selectedSubmission.submitted_at)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
