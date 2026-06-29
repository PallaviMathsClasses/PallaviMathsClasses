import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const date = url.searchParams.get('date')
  const studentId = url.searchParams.get('studentId')
  
  const supabase = createServerClient()
  let query = supabase.from('attendance').select('*, student:students(*)')
  
  if (date) query = query.eq('date', date)
  if (studentId) query = query.eq('student_id', studentId)
  
  query = query.order('date', { ascending: false })
  
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attendance: data })
}

export async function POST(req: Request) {
  const { studentId, date, present } = await req.json()
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('attendance')
    .upsert(
      { student_id: studentId, date, present, updated_at: new Date().toISOString() },
      { onConflict: 'student_id,date' }
    )
    .select()
    .single()
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attendance: data })
}
