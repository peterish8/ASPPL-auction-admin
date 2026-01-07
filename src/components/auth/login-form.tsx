'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl bg-zinc-900/50 border-zinc-800 shadow-2xl overflow-hidden">
      <div className="grid md:grid-cols-2 h-full min-h-[500px]">
        {/* Left Side - Branding */}
        <div className="relative hidden md:flex flex-col items-center justify-center p-10 bg-linear-to-br from-zinc-800/50 to-zinc-900/50 border-r border-zinc-800">
          <div className="absolute inset-0 bg-blue-500/5 opacity-20 bg-size-[20px_20px] mask-[radial-gradient(circle_at_center,white,transparent_80%)]" />
          <div className="relative z-10 text-center space-y-4">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20 mb-6">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">ASPPL Admin Portal</h2>
            <p className="text-zinc-400 text-lg max-w-xs mx-auto">
              Secure control panel for ASPPL Auction Management System
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col justify-center p-10 md:p-12 bg-zinc-900/30">
          <div className="space-y-2 mb-8 text-center md:text-left">
            {/* Desktop Text */}
            <div className="hidden md:block space-y-2">
              <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-zinc-400 text-base">
                Please enter your details to sign in
              </p>
            </div>
            
            {/* Mobile Text */}
            <div className="md:hidden space-y-2">
              <h1 className="text-3xl font-bold text-white">Admin Login</h1>
              <p className="text-zinc-400 text-base">
                Enter your credentials to access the dashboard
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 h-12 text-lg px-4 focus-visible:ring-blue-500/50"
              />
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-800/80 border-zinc-700 text-white placeholder:text-zinc-600 h-12 text-lg px-4 focus-visible:ring-blue-500/50"
              />
            </div>
            
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-medium mt-4 shadow-lg shadow-blue-900/20"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </Button>
          </form>
        </div>
      </div>
    </Card>
  )
}
