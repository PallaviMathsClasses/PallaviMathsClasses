import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const { deviceHash } = await req.json()
  if (!deviceHash) return NextResponse.json({ error: 'Missing deviceHash' }, { status: 400 })
  
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
