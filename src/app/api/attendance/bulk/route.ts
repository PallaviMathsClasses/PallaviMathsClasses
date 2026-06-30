import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { records } = await req.json()
  const supabase = createServerClient()
  
  const rows = records.map((r: { studentId: string; date: string; present: boolean }) => ({
    student_id: r.studentId,
    date: r.date,
    present: r.present,
    updated_at: new Date().toISOString(),
  }))
  
  const { error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'student_id,date' })
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, count: rows.length })
}
