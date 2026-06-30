import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const active = url.searchParams.get('active')
  const batchId = url.searchParams.get('batchId')
  
  const supabase = createServerClient()
  let query = supabase
    .from('students')
    .select('*, batch:batches(*)')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (active === 'true') query = query.eq('is_active', true)
  if (batchId) query = query.eq('batch_id', batchId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ students: data })
}

export async function POST(req: Request) {
  const body = await req.json()
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('students')
    .insert({
      name: body.name,
      class_name: body.class_name,
      batch_id: body.batch_id || null,
      parent_name: body.parent_name || null,
      phone: body.phone || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ student: data })
}

export async function PUT(req: Request) {
  const body = await req.json()
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('students')
    .update({
      name: body.name,
      class_name: body.class_name,
      batch_id: body.batch_id || null,
      parent_name: body.parent_name || null,
      phone: body.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ student: data })
}

export async function DELETE(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const supabase = createServerClient()
  const { error } = await supabase
    .from('students')
    .update({ is_active: false })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
