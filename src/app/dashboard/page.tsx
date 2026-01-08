import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, MapPin, List, ClipboardList } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch stats
  const [tradesResult, poolingResult, dropdownsResult, submissionsResult] = await Promise.all([
    supabase.from('trades').select('*', { count: 'exact' }),
    supabase.from('pooling_schedule').select('*', { count: 'exact' }),
    supabase.from('dropdowns').select('*', { count: 'exact' }),
    supabase.from('submissions').select('*', { count: 'exact' }),
  ])

  // Get active trade
  const { data: activeTrade } = await supabase
    .from('trades')
    .select('*')
    .eq('is_active', true)
    .single()

  // Get recent submissions
  const { data: recentSubmissions } = await supabase
    .from('submissions')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Total Trades', value: tradesResult.count || 0, icon: FileText, color: 'text-blue-400' },
    { label: 'Pooling Locations', value: poolingResult.count || 0, icon: MapPin, color: 'text-green-400' },
    { label: 'Dropdown Options', value: dropdownsResult.count || 0, icon: List, color: 'text-purple-400' },
    { label: 'Total Submissions', value: submissionsResult.count || 0, icon: ClipboardList, color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 id="dashboard-title" className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-zinc-400 mt-1">Welcome to the Trade & Auction Control Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Trade Card */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Active Trade</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTrade ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">Trade {activeTrade.trade_number}</p>
                <p className="text-zinc-400">{formatDate(activeTrade.trade_date)}</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                ACTIVE
              </Badge>
            </div>
          ) : (
            <p className="text-zinc-400">No active trade. Create one in the Trades section.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSubmissions && recentSubmissions.length > 0 ? (
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                  <div>
                    <p className="font-medium text-white">{sub.name}</p>
                    <p className="text-sm text-zinc-400">{sub.phone} • {sub.depot}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-300">{sub.weight} kg</p>
                    <p className="text-xs text-zinc-500">{formatDate(sub.submitted_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400">No submissions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
