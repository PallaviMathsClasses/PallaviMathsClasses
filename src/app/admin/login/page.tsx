'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Check if already authed via device token
    const auth = localStorage.getItem('pallavi_admin_auth')
    const deviceToken = document.cookie.match(/device_token=([^;]+)/)?.[1]
    if (auth === 'true' || deviceToken) {
      router.replace('/admin/attendance')
    }

    // Handle OAuth callback
    const supabase = createBrowserClient()
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email === 'pallaviclasses@gmail.com') {
        // Save device token
        const deviceHash = btoa(navigator.userAgent + (navigator.hardwareConcurrency || 4))
          .replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
        
        await fetch('/api/auth/device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceHash }),
        })

        document.cookie = `device_token=${deviceHash}; max-age=${365 * 24 * 3600}; path=/; SameSite=Lax`
        localStorage.setItem('pallavi_admin_auth', 'true')
        router.replace('/admin/attendance')
      } else if (event === 'SIGNED_IN') {
        setError('Access restricted to pallaviclasses@gmail.com only.')
        await supabase.auth.signOut()
      }
    })
  }, [router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/login`,
        queryParams: { login_hint: 'pallaviclasses@gmail.com' },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-50 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-4">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pallavi Maths</h1>
          <p className="text-gray-500 text-sm mt-1">Admin access only</p>
        </div>

        {/* Card */}
        <div className="card shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome back, Pallavi</h2>
          <p className="text-sm text-gray-500 mb-6">
            Sign in with your Google account to manage attendance, results, and students.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-medium
                       hover:bg-gray-50 active:scale-95 transition-all duration-150 shadow-sm
                       flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Access restricted to pallaviclasses@gmail.com
          </p>
        </div>

        {/* Device memory notice */}
        <p className="text-xs text-gray-400 text-center mt-4">
          This device will be remembered — no re-login needed next time
        </p>

        <div className="text-center mt-8">
          <a href="/" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  )
}
