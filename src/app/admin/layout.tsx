'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

const NAV = [
  { href: '/admin/attendance', icon: '✅', label: 'Attendance' },
  { href: '/admin/create-exam', icon: '📝', label: 'Create Exam' },
  { href: '/admin/students', icon: '👥', label: 'Students' },
  { href: '/admin/result-links', icon: '🔗', label: 'Result Links' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const auth = localStorage.getItem('pallavi_admin_auth')
    const deviceToken = document.cookie.match(/device_token=([^;]+)/)?.[1]
    if (auth === 'true' || deviceToken) {
      setIsAuthed(true)
    } else {
      setIsAuthed(false)
      router.replace('/admin/login')
    }
  }, [router])

  if (isAuthed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthed) return null

  const currentNav = NAV.find(n => pathname.startsWith(n.href))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="page-header">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <div className="font-semibold text-gray-900 text-sm leading-tight">
                {currentNav?.label || 'Admin'}
              </div>
              <div className="text-xs text-gray-400">Pallavi Maths</div>
            </div>
          </div>
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
            <span className="text-brand-700 text-xs font-bold">PA</span>
          </div>
        </div>
      </div>

      {/* Slide-in drawer menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-xl animate-slide-up">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Pallavi Maths</div>
                  <div className="text-xs text-gray-500">Admin panel</div>
                </div>
              </div>
            </div>
            <nav className="p-3 space-y-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`admin-nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <Link href="/" className="admin-nav-item text-gray-500 text-sm">
                <span>🏠</span>
                <span>View website</span>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('pallavi_admin_auth')
                  document.cookie = 'device_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
                  router.replace('/admin/login')
                }}
                className="admin-nav-item text-red-500 w-full text-left text-sm mt-1"
              >
                <span>🚪</span>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom nav for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-pb z-30 md:hidden">
        <div className="grid grid-cols-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 text-xs transition-colors ${
                pathname.startsWith(item.href)
                  ? 'text-brand-600'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
