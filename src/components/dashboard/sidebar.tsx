'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  FileText,
  MapPin,
  List,
  ClipboardList,
  RotateCcw,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTour } from '@/components/tour/tour-context'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/trades', label: 'Trades', icon: FileText },
  { href: '/dashboard/pooling', label: 'Pooling Schedule', icon: MapPin },
  { href: '/dashboard/dropdowns', label: 'Dropdowns', icon: List },
  { href: '/dashboard/submissions', label: 'Submissions', icon: ClipboardList },
  { href: '/dashboard/reset', label: 'Weekly Reset', icon: RotateCcw },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  
  // Safe tour context usage
  let isTourActive = false
  try {
    const tour = useTour()
    isTourActive = tour.isActive
  } catch (e) {
    // Ignore error if used outside provider
  }

  // Auto-open sidebar on mobile when tour is active
  useEffect(() => {
    if (isTourActive) {
      setMobileOpen(true)
    }
  }, [isTourActive])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button - RIGHT side */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-zinc-900 border-zinc-700"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - slides from RIGHT on mobile */}
      <aside className={cn(
        "fixed lg:static inset-y-0 right-0 lg:right-auto lg:left-0 z-50 w-64 bg-zinc-900/95 border-l lg:border-l-0 lg:border-r border-zinc-800 flex flex-col transition-transform duration-200",
        mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-white">
              ASPPL Admin
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Control Panel</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -mt-1 -mr-2 text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-zinc-800">
          {!mounted ? (
            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 data-[state=open]:bg-zinc-800"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  side="top" 
                  align="center" 
                  sideOffset={32}
                  className="w-56 bg-zinc-900 border-zinc-800"
                >
                  <DropdownMenuItem 
                    className="bg-red-600 text-white focus:bg-red-700 focus:text-white cursor-pointer p-3 m-1 rounded-md justify-center font-medium"
                    onClick={() => setShowSignOutDialog(true)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Confirm Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-white">Sign out?</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Are you sure you want to sign out of the admin panel?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSignOutDialog(false)}
                      className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleLogout} 
                      className="bg-red-600 hover:bg-red-700 text-white border-0"
                    >
                      Sign Out
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-zinc-500 transition-colors select-none">
              Designed by PTC
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
