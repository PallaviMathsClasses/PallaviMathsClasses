'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If on /admin directly, redirect to attendance (auth check is in layout)
    if (pathname === '/admin') {
      router.replace('/admin/attendance')
    }
  }, [router, pathname])

  return null
}