import { createServerClient } from './supabase'

const ADMIN_EMAIL = 'pallaviclasses@gmail.com'

export async function getDeviceSession(deviceHash: string) {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('device_sessions')
    .select('*')
    .eq('device_hash', deviceHash)
    .eq('user_email', ADMIN_EMAIL)
    .single()
  return data
}

export async function saveDeviceSession(deviceHash: string) {
  const supabase = createServerClient()
  await supabase
    .from('device_sessions')
    .upsert({
      device_hash: deviceHash,
      user_email: ADMIN_EMAIL,
      last_seen: new Date().toISOString(),
    }, { onConflict: 'device_hash' })
}

export async function isAdminSession(req: Request): Promise<boolean> {
  const cookie = req.headers.get('cookie') || ''
  const deviceToken = cookie.match(/device_token=([^;]+)/)?.[1]
  if (!deviceToken) return false
  const session = await getDeviceSession(deviceToken)
  return !!session
}

export const ADMIN_EMAIL_CONST = ADMIN_EMAIL
