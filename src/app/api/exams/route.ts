import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const published = url.searchParams.get('published')
  
  const supabase = createServerClient()
  let query = supabase
    .from('exams')
    .select('*, batch:batches(*)')
    .order('test_date', { ascending: false })
  
  if (published === 'true') query = query.eq('is_published', true)
  
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ exams: data })
}

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createServerClient()
  
  // Create exam
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .insert({
      test_name: body.testName,
      test_date: body.testDate,
      class_name: body.className,
      batch_id: body.batchId,
      max_marks: body.maxMarks || 100,
      is_published: body.publish === true,
    })
    .select()
    .single()
  
  if (examError) return NextResponse.json({ error: examError.message }, { status: 500 })
  
  // Insert results
  if (body.results && body.results.length > 0) {
    const resultRows = body.results.map((r: { studentId: string; marksObtained: string; comment: string }) => ({
      exam_id: exam.id,
      student_id: r.studentId,
      marks_obtained: r.marksObtained !== '' ? parseFloat(r.marksObtained) : null,
      comment: r.comment || null,
    }))
    await supabase.from('exam_results').insert(resultRows)
  }
  
  return NextResponse.json({ exam })
}

export async function PUT(req: Request) {
  const body = await req.json()
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('exams')
    .update({
      test_name: body.testName,
      test_date: body.testDate,
      is_published: body.isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single()
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ exam: data })
}
