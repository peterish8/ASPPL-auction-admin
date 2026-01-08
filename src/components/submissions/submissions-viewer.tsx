'use client'

import { useState, useMemo, useEffect } from 'react'
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
  FileJson, 
  Copy, 
  Search, 
  Filter, 
  RefreshCw,
  X,
  Eye,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface SubmissionsViewerProps {
  initialSubmissions: Submission[]
  trades: Trade[]
  depots: DropdownOption[]
  types: DropdownOption[]
  details: DropdownOption[]
}

export function SubmissionsViewer({ 
  initialSubmissions, 
  trades, 
  depots, 
  types,
  details
}: SubmissionsViewerProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    trade_number: 'all',
    depot: 'all',
    type: 'all',
    details: 'all',
  })
  const [removeDuplicates, setRemoveDuplicates] = useState<'none' | 'name' | 'phone'>('none')
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  
  const [mounted, setMounted] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])


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

  // Get unique trade numbers from trades table
  const tradeNumbers = useMemo(() => {
    return trades.map(t => t.trade_number).filter(Boolean).sort()
  }, [trades])

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    const initialFiltered = submissions.filter(sub => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          sub.name.toLowerCase().includes(query) ||
          sub.phone_number.toLowerCase().includes(query) ||
          sub.details.toLowerCase().includes(query) ||
          sub.depot.toLowerCase().includes(query) ||
          sub.type.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Trade filter
      if (filters.trade_number !== 'all' && sub.trade_number !== filters.trade_number) {
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

      // Details filter
      if (filters.details !== 'all' && sub.details !== filters.details) {
        return false
      }

      return true
    })

    // Apply strict duplicate removal
    if (removeDuplicates !== 'none') {
      const seen = new Set<string>()
      return initialFiltered.filter(sub => {
        const key = removeDuplicates === 'name' ? sub.name.trim().toLowerCase() : sub.phone_number.trim()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    return initialFiltered
  }, [submissions, searchQuery, filters, removeDuplicates])

  // Detect duplicate device fingerprints
  // Detect duplicate device fingerprints and assign group IDs
  const duplicateGroups = useMemo(() => {
    const fpCounts = new Map<string, number>()
    
    // 1. Count occurrences in VISIBLE list
    filteredSubmissions.forEach(sub => {
      if (sub.device_fingerprint) {
        fpCounts.set(sub.device_fingerprint, (fpCounts.get(sub.device_fingerprint) || 0) + 1)
      }
    })
    
    // 2. Assign unique color index to each duplicate group
    const groups = new Map<string, number>()
    let currentGroupIndex = 0
    
    fpCounts.forEach((count, fp) => {
      if (count > 1) {
        groups.set(fp, currentGroupIndex)
        currentGroupIndex++
      }
    })
    
    return groups
  }, [filteredSubmissions])

  const getDuplicateStyle = (sub: Submission) => {
    if (!sub.device_fingerprint || !duplicateGroups.has(sub.device_fingerprint)) return null
    
    const groupIndex = duplicateGroups.get(sub.device_fingerprint)!
    const styles = [
      { border: 'border-l-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/20' },
      { border: 'border-l-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500/20' },
      { border: 'border-l-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-400', badge: 'bg-cyan-500/20' },
      { border: 'border-l-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-400', badge: 'bg-pink-500/20' },
      { border: 'border-l-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400', badge: 'bg-yellow-500/20' },
    ]
    
    // Cycle through styles if we have more groups than colors
    return styles[groupIndex % styles.length]
  }

  const clearFilters = () => {
    setFilters({ trade_number: 'all', depot: 'all', type: 'all', details: 'all' })
    setSearchQuery('')
    setRemoveDuplicates('none')
  }

  const hasActiveFilters = 
    filters.trade_number !== 'all' || 
    filters.depot !== 'all' || 
    filters.type !== 'all' || 
    filters.type !== 'all' || 
    filters.details !== 'all' ||
    removeDuplicates !== 'none' ||
    searchQuery !== ''

  // Calculate total weight of filtered submissions
  const totalWeight = useMemo(() => {
    return filteredSubmissions.reduce((sum, sub) => sum + (Number(sub.weight) || 0), 0)
  }, [filteredSubmissions])

  // Export functions
  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No data to export')
      return
    }
    const exportData = filteredSubmissions.map(sub => ({
      Name: sub.name,
      Phone: sub.phone_number,
      Details: sub.details,
      Weight: sub.weight,
      Type: sub.type,
      Depot: sub.depot,
      'Trade Number': sub.trade_number || 'N/A',
      'Submitted At': formatDateTime(sub.submitted_at),
    }))
    const filename = filters.trade_number !== 'all' 
      ? `submissions_trade_${filters.trade_number}_${new Date().toISOString().split('T')[0]}`
      : `submissions_${new Date().toISOString().split('T')[0]}`
    exportToCSV(exportData, filename)
    toast.success(`Exported ${filteredSubmissions.length} submissions to CSV`)
  }

  const handleExportJSON = () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No data to export')
      return
    }
    const filename = filters.trade_number !== 'all' 
      ? `submissions_trade_${filters.trade_number}_${new Date().toISOString().split('T')[0]}`
      : `submissions_${new Date().toISOString().split('T')[0]}`
    exportToJSON(filteredSubmissions, filename)
    toast.success(`Exported ${filteredSubmissions.length} submissions to JSON`)
  }

  const handleCopyToClipboard = async () => {
    if (filteredSubmissions.length === 0) {
      toast.error('No data to copy')
      return
    }
    const text = filteredSubmissions.map(sub => 
      `${sub.name} | ${sub.phone_number} | ${sub.details} | ${sub.weight}kg | ${sub.type} | ${sub.depot} | Trade: ${sub.trade_number}`
    ).join('\n')
    const success = await copyToClipboard(text)
    if (success) {
      toast.success(`Copied ${filteredSubmissions.length} submissions to clipboard`)
    } else {
      toast.error('Failed to copy')
    }
  }

  const viewSubmission = (sub: Submission) => {
    setSelectedSubmission(sub)
    setViewOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mr-14 lg:mr-0">
        <div>
          <h1 id="submissions-title" className="text-3xl font-bold text-white">Submissions</h1>
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
        <CardHeader className="pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="h-5 w-5 text-zinc-400" />
              <CardTitle className="text-white text-lg">Filters</CardTitle>
            </div>
            {/* Search bar in header */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-zinc-800 border-zinc-700 h-9"
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-zinc-400 hover:text-white shrink-0"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

            {/* Trade Filter - Shows trade numbers */}
            <Select
              value={filters.trade_number}
              onValueChange={(v) => setFilters({ ...filters, trade_number: v })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Filter by Trade" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Trades</SelectItem>
                {tradeNumbers.map((num) => (
                  <SelectItem key={num} value={num}>
                    Trade {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Details Filter - From Supabase */}
            <Select
              value={filters.details}
              onValueChange={(v) => setFilters({ ...filters, details: v })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Filter by Details" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">All Details</SelectItem>
                {details.map((detail) => (
                  <SelectItem key={detail.id} value={detail.label}>
                    {detail.label}
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

            {/* Remove Duplicates Filter */}
            <Select
              value={removeDuplicates}
              // @ts-ignore
              onValueChange={(v) => setRemoveDuplicates(v as 'none' | 'name' | 'phone')}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Duplicates" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="none">Show All</SelectItem>
                <SelectItem value="name">Unique Names</SelectItem>
                <SelectItem value="phone">Unique Phones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats & Actions */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-zinc-900/50 border-zinc-800 p-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Filtered Count</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-white">{filteredSubmissions.length}</span>
                <span className="text-sm text-zinc-500">of {submissions.length}</span>
              </div>
            </div>
          </Card>
          
          <Card className="bg-zinc-900/50 border-zinc-800 p-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Weight</span>
              <span className="text-2xl font-bold text-green-400 mt-1">
                {totalWeight.toLocaleString()} <span className="text-sm font-normal text-zinc-500">kg</span>
              </span>
            </div>
          </Card>
        </div>

        {/* Desktop Export Buttons */}
        <div className="hidden lg:flex justify-end gap-2">
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
            Copy {filteredSubmissions.length > 0 ? `(${filteredSubmissions.length})` : ''}
          </Button>
        </div>

        {/* Mobile Export Buttons */}
        <div className="flex lg:hidden items-center gap-2">
          <span className="text-zinc-400 text-sm">Export:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="border-zinc-700 hover:bg-green-900/20 hover:border-green-700 hover:text-green-400 px-2"
          >
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="border-zinc-700 hover:bg-blue-900/20 hover:border-blue-700 hover:text-blue-400 px-2"
          >
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyToClipboard}
            className="border-zinc-700 hover:bg-purple-900/20 hover:border-purple-700 hover:text-purple-400 px-2"
          >
            Copy
          </Button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                <TableHead className="text-zinc-400 w-12">#</TableHead>
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
                  <TableCell colSpan={10} className="text-center text-zinc-400 py-12">
                    {hasActiveFilters 
                      ? 'No submissions match your filters.' 
                      : 'No submissions found.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((sub, index) => {
                  const dupStyle = getDuplicateStyle(sub)
                  return (
                    <TableRow 
                      key={sub.id} 
                      className={`border-zinc-800 hover:bg-zinc-900/50 ${dupStyle ? `${dupStyle.bg} border-l-2 ${dupStyle.border}` : ''}`}
                    >
                      <TableCell className="text-zinc-500 font-medium">
                        <div className="flex items-center gap-1">
                          {index + 1}
                          {dupStyle && (
                            <AlertTriangle className={`h-3 w-3 ${dupStyle.text}`} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          {sub.name}
                          {dupStyle && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${dupStyle.badge} ${dupStyle.text} font-medium`}>
                              SAME DEVICE ({duplicateGroups.get(sub.device_fingerprint || '')! + 1})
                            </span>
                          )}
                        </div>
                      </TableCell>
                    <TableCell className="text-zinc-300">{sub.phone_number}</TableCell>
                    <TableCell className="text-zinc-300 max-w-[200px] truncate" title={sub.details}>
                      {sub.details}
                    </TableCell>
                    <TableCell className="text-zinc-300">
                      <span className="font-medium text-blue-400">{sub.weight}</span> kg
                    </TableCell>
                    <TableCell className="text-zinc-300">{sub.type}</TableCell>
                    <TableCell className="text-zinc-300">{sub.depot}</TableCell>
                    <TableCell className="text-zinc-400 font-medium">
                      {sub.trade_number || 'N/A'}
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
                  )
                })
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
          
          {/* Copy/Export buttons */}
          {selectedSubmission && (
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <span className="text-xs text-zinc-500">Export:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const text = `Name: ${selectedSubmission.name}\nPhone: ${selectedSubmission.phone_number}\nWeight: ${selectedSubmission.weight} kg\nType: ${selectedSubmission.type}\nDepot: ${selectedSubmission.depot}\nDetails: ${selectedSubmission.details}\nTrade: ${selectedSubmission.trade_number || 'N/A'}\nSubmitted: ${formatDateTime(selectedSubmission.submitted_at)}`
                  await copyToClipboard(text)
                  toast.success('Copied to clipboard')
                }}
                className="h-7 px-2 border-zinc-700 hover:bg-zinc-800"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const jsonData = {
                    name: selectedSubmission.name,
                    phone: selectedSubmission.phone_number,
                    weight: selectedSubmission.weight,
                    type: selectedSubmission.type,
                    depot: selectedSubmission.depot,
                    details: selectedSubmission.details,
                    trade_number: selectedSubmission.trade_number,
                    submitted_at: selectedSubmission.submitted_at
                  }
                  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `submission_${selectedSubmission.name.replace(/\s+/g, '_')}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Downloaded as JSON')
                }}
                className="h-7 px-2 border-zinc-700 hover:bg-zinc-800"
              >
                <FileJson className="h-3 w-3 mr-1" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const headers = 'Name,Phone,Weight,Type,Depot,Details,Trade,Submitted'
                  const row = `"${selectedSubmission.name}","${selectedSubmission.phone_number}",${selectedSubmission.weight},"${selectedSubmission.type}","${selectedSubmission.depot}","${selectedSubmission.details}","${selectedSubmission.trade_number || 'N/A'}","${formatDateTime(selectedSubmission.submitted_at)}"`
                  const csv = `${headers}\n${row}`
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `submission_${selectedSubmission.name.replace(/\s+/g, '_')}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('Downloaded as CSV')
                }}
                className="h-7 px-2 border-zinc-700 hover:bg-zinc-800"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                CSV
              </Button>
            </div>
          )}

          {selectedSubmission && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Name</p>
                  <p className="text-white font-medium mt-1">{selectedSubmission.name}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Phone</p>
                  <p className="text-white font-medium mt-1">{selectedSubmission.phone_number}</p>
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
                    {selectedSubmission.trade_number || 'N/A'}
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

              {/* Debug: Show Device Fingerprint */}
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Device Fingerprint (Debug ID)</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-[10px] bg-zinc-950 px-2 py-1 rounded text-zinc-400 font-mono break-all border border-zinc-800">
                    {selectedSubmission.device_fingerprint || 'No fingerprint detected'}
                  </code>
                  {selectedSubmission.device_fingerprint && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSubmission.device_fingerprint!)
                        toast.success('Fingerprint ID copied')
                      }}
                    >
                      <Copy className="h-3 w-3 text-zinc-500" />
                    </Button>
                  )}
                </div>
                <p className="text-[10px] text-zinc-600 mt-1">
                  If this ID differs from another submission, they are treated as different devices (e.g. Incognito mode, different browser).
                </p>
              </div>

              {/* Debug: Raw Timestamps */}
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Raw Stored Timestamp (UTC)</p>
                <code className="text-[10px] bg-zinc-950 px-2 py-1 rounded text-zinc-400 font-mono mt-1 block w-fit border border-zinc-800">
                  {selectedSubmission.submitted_at}
                </code>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
