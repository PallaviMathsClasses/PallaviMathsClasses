import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Simple PIN hash for verification — the PIN is checked server-side only
// Default PIN: 1234 (Pallavi can change it in the DB later)
const ADMIN_PIN_HASH = '7110eda4d09e062aa5e4a390b0a572ac0d2c0220' // SHA-1 of "1234"

export async function POST(req: Request) {
  const body = await req.json()
  const { pin, deviceHash } = body

  // PIN login
  if (pin !== undefined) {
    // Hash the PIN with SHA-1 (simple, server-side only)
    const encoder = new TextEncoder()
    const data = encoder.encode(pin)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (hashHex !== ADMIN_PIN_HASH) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 })
    }

    // Register the device
    if (deviceHash) {
      const supabase = createServerClient()
      await supabase
        .from('device_sessions')
        .upsert({
          device_hash: deviceHash,
          user_email: 'pallaviclasses@gmail.com',
          last_seen: new Date().toISOString(),
        }, { onConflict: 'device_hash' })
    }

    return NextResponse.json({ success: true })
  }

  // Device session registration (legacy support)
  if (deviceHash) {
    const supabase = createServerClient()
    await supabase
      .from('device_sessions')
      .upsert({
        device_hash: deviceHash,
        user_email: 'pallaviclasses@gmail.com',
        last_seen: new Date().toISOString(),
      }, { onConflict: 'device_hash' })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Missing pin or deviceHash' }, { status: 400 })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const deviceHash = url.searchParams.get('deviceHash')
  if (!deviceHash) return NextResponse.json({ valid: false })

  const supabase = createServerClient()
  const { data } = await supabase
    .from('device_sessions')
    .select('id')
    .eq('device_hash', deviceHash)
    .eq('user_email', 'pallaviclasses@gmail.com')
    .single()

  return NextResponse.json({ valid: !!data })
}