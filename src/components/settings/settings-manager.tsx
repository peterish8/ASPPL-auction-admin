'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Settings, 
  Calendar, 
  Save, 
  CheckCircle,
  Info,
  HelpCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useTour } from '@/components/tour/tour-context'

interface SettingsManagerProps {
  initialNextOpeningDate: string
}

export function SettingsManager({ initialNextOpeningDate }: SettingsManagerProps) {
  const [nextOpeningDate, setNextOpeningDate] = useState(initialNextOpeningDate)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const { startTour } = useTour()
  
  const supabase = createClient()

  const handleSave = async () => {
    if (!nextOpeningDate.trim()) {
      toast.error('Please enter a date')
      return
    }
    
    setLoading(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          value: nextOpeningDate.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('key', 'next_opening_date')

      if (error) throw error
      
      toast.success('Settings saved successfully')
      setSaved(true)
      
      // Reset saved indicator after 3 seconds
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  // Format date for display preview
  const formatDatePreview = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mr-14 lg:mr-0">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-zinc-400 mt-1">Configure system settings and public display options</p>
      </div>

      {/* Next Opening Date Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white">Next Booking Opening Date</CardTitle>
              <CardDescription className="text-zinc-400">
                This date is displayed to farmers on the booking success screen
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-1">How this works:</p>
              <p className="text-blue-300/80">
                After a farmer submits a booking, they see a success message with this date 
                indicating when the next booking window opens. Update this weekly to keep 
                farmers informed.
              </p>
            </div>
          </div>

          {/* Date Input */}
          <div className="space-y-3">
            <Label htmlFor="next_opening_date" className="text-zinc-300">
              Next Opening Date
            </Label>
            <Input
              id="next_opening_date"
              type="date"
              value={nextOpeningDate}
              onChange={(e) => setNextOpeningDate(e.target.value)}
              className="bg-zinc-800 border-zinc-700 max-w-xs"
            />
            
            {/* Date Preview */}
            {nextOpeningDate && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-500">Preview:</span>
                <span className="text-green-400 font-medium">
                  {formatDatePreview(nextOpeningDate)}
                </span>
              </div>
            )}
          </div>

          {/* Example of how it appears */}
          <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
              How farmers will see it:
            </p>
            <div className="p-3 rounded bg-green-500/10 border border-green-500/30">
              <p className="text-green-300 text-sm">
                ✅ Your booking has been submitted successfully!
              </p>
              <p className="text-green-200/70 text-sm mt-1">
                Next booking opens on: <span className="font-semibold text-green-300">{formatDatePreview(nextOpeningDate) || 'Not set'}</span>
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            
            {saved && (
              <span className="text-green-400 text-sm animate-pulse">
                Changes saved successfully
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Website Tour Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <HelpCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-white">About Admin Website</CardTitle>
              <CardDescription className="text-zinc-400">
                Take a quick tour to understand how the dashboard works
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
            <div>
              <p className="font-medium text-white mb-1">New to the dashboard?</p>
              <p className="text-sm text-zinc-400">
                Start an interactive tour to learn about all the features and controls available to you.
              </p>
            </div>
            <Button 
              onClick={startTour}
              className="bg-purple-600 hover:bg-purple-700 ml-4 shrink-0"
            >
              Start Tour
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings Placeholder */}
      <Card className="bg-zinc-900/50 border-zinc-800 border-dashed max-w-2xl opacity-50">
        <CardContent className="py-8 text-center">
          <p className="text-zinc-500 text-sm">
            More settings can be added here in the future
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
