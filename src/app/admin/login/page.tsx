'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

function getDeviceHash() {
  return btoa(navigator.userAgent + (navigator.hardwareConcurrency || 4) + screen.width + screen.height)
    .replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
}

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const pinRef = useRef(pin)
  pinRef.current = pin

  useEffect(() => {
    const auth = localStorage.getItem('pallavi_admin_auth')
    const deviceToken = document.cookie.match(/device_token=([^;]+)/)?.[1]
    if (auth === 'true' || deviceToken) {
      router.replace('/admin/attendance')
      return
    }
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [router])

  const handleLogin = useCallback(async (pinValue?: string) => {
    const currentPin = pinValue || pinRef.current
    if (currentPin.length < 4) {
      setError('Enter 4-digit PIN')
      return
    }
    setLoading(true)
    setError('')

    const deviceHash = getDeviceHash()

    try {
      const res = await fetch('/api/auth/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: currentPin, deviceHash }),
      })
      const data = await res.json()

      if (data.success) {
        document.cookie = `device_token=${deviceHash}; max-age=${365 * 24 * 3600}; path=/; SameSite=Lax`
        localStorage.setItem('pallavi_admin_auth', 'true')
        router.replace('/admin/attendance')
      } else {
        setError(data.error || 'Login failed')
        setPin('')
        pinRef.current = ''
        inputRef.current?.focus()
      }
    } catch {
      setError('Network error. Try again.')
      setPin('')
      pinRef.current = ''
    }

    setLoading(false)
  }, [router])

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4 && !loading) {
      const timer = setTimeout(() => handleLogin(pin), 200)
      return () => clearTimeout(timer)
    }
  }, [pin, loading, handleLogin])

  const addDigit = (digit: string) => {
    if (pin.length < 4 && !loading) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')
    }
  }

  const deleteDigit = () => {
    if (!loading) {
      setPin(p => p.slice(0, -1))
      setError('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-indigo-50 flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-600 rounded-3xl flex items-center justify-center shadow-xl mx-auto mb-4">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pallavi Mam Maths</h1>
          <p className="text-gray-500 text-sm mt-1">Admin access only</p>
        </div>

        {/* Card */}
        <div className="card shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome back, Pallavi</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter your 4-digit PIN to manage attendance, results, and students.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm text-center">
              {error}
            </div>
          )}

          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-150 ${
                  pin.length > i
                    ? 'border-brand-600 bg-orange-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-300'
                } ${pin.length === i && !loading ? 'border-brand-400 ring-2 ring-brand-100' : ''}`}
              >
                {pin[i] ? '●' : ''}
              </div>
            ))}
          </div>

          {/* Hidden native input (for keyboard support on mobile) */}
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4)
              setPin(val)
              setError('')
            }}
            onKeyDown={handleKeyDown}
            className="opacity-0 absolute w-0 h-0 overflow-hidden pointer-events-none"
            autoComplete="off"
          />

          {/* Tap to focus native keyboard */}
          <button
            onClick={() => inputRef.current?.focus()}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-xl text-sm font-medium
                       hover:bg-gray-200 active:scale-95 transition-all duration-150 mb-3 disabled:opacity-50"
          >
            {pin.length === 0 ? 'Tap to type PIN' : 'Tap to edit'}
          </button>

          {/* On-screen numpad */}
          <div className="grid grid-cols-3 gap-2">
            {['1','2','3','4','5','6','7','8','9','','0','del'].map((key) => {
              if (key === '') return <div key="empty" />
              if (key === 'del') {
                return (
                  <button
                    key="del"
                    onClick={deleteDigit}
                    disabled={loading}
                    className="h-14 rounded-xl text-lg font-medium text-red-500 bg-red-50
                               hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50"
                  >
                    ⌫
                  </button>
                )
              }
              return (
                <button
                  key={key}
                  onClick={() => addDigit(key)}
                  disabled={loading}
                  className="h-14 rounded-xl text-xl font-semibold text-gray-700 bg-white border border-gray-200
                             hover:bg-gray-50 active:scale-95 active:bg-brand-50 active:text-brand-700 transition-all disabled:opacity-50"
                >
                  {key}
                </button>
              )
            })}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-brand-600">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              Verifying…
            </div>
          )}
        </div>

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