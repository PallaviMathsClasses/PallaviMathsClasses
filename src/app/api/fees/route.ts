import { createServerClient, type Student } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']

// GET /api/fees?class=10th — returns all students with their fee data for the academic year
export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const filterClass = searchParams.get('class') || ''

  // Fetch active students
  let query = supabase
    .from('students')
    .select('*, batch:batches(*)')
    .eq('is_active', true)
    .order('class_name')
    .order('name')

  if (filterClass) query = query.eq('class_name', filterClass)

  const { data: students, error: studentErr } = await query
  if (studentErr) return NextResponse.json({ error: studentErr.message }, { status: 500 })

  if (!students || students.length === 0) {
    return NextResponse.json({ students: [], months: MONTHS })
  }

  const studentIds = students.map(s => s.id)

  // Fetch all fee records for these students
  const { data: fees, error: feeErr } = await supabase
    .from('fee_history')
    .select('*')
    .in('student_id', studentIds)

  if (feeErr) return NextResponse.json({ error: feeErr.message }, { status: 500 })

  // Build a map: studentId -> month -> fee record
  const feeMap: Record<string, Record<string, any>> = {}
  for (const f of (fees || [])) {
    if (!feeMap[f.student_id]) feeMap[f.student_id] = {}
    feeMap[f.student_id][f.month] = f
  }

  // Attach fee data to each student
  const studentsWithFees = students.map(s => ({
    ...s,
    fees: MONTHS.reduce((acc, month) => {
      const record = feeMap[s.id]?.[month]
      acc[month] = record ? { amount: record.amount, paid: record.paid, id: record.id } : null
      return acc
    }, {} as Record<string, any>),
  }))

  return NextResponse.json({ students: studentsWithFees, months: MONTHS })
}

// POST /api/fees — upsert fee records (bulk save)
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { records } = body as { records: { studentId: string; month: string; amount: number | null; paid: boolean }[] }

  if (!records || !Array.isArray(records)) {
    return NextResponse.json({ error: 'records array required' }, { status: 400 })
  }

  const upserts = records.map(r => ({
    student_id: r.studentId,
    month: r.month,
    amount: r.amount,
    paid: r.paid,
  }))

  // Use upsert with on conflict on (student_id, month)
  const { data, error } = await supabase
    .from('fee_history')
    .upsert(upserts, { onConflict: 'student_id,month' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, count: data?.length || 0 })
}