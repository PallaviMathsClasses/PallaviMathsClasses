import { createClient } from '@supabase/supabase-js'

export type Batch = {
  id: string
  name: string
  class_name: string
  timing: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export type Student = {
  id: string
  name: string
  class_name: string
  batch_id: string | null
  parent_name: string | null
  phone: string | null
  sort_order: number
  is_active: boolean
  public_slug: string
  created_at: string
  updated_at: string
  batch?: Batch
}

export type Attendance = {
  id: string
  student_id: string
  batch_id: string | null
  date: string
  present: boolean
  note: string | null
  created_at: string
  updated_at: string
  student?: Student
}

export type Exam = {
  id: string
  test_name: string
  test_date: string
  class_name: string
  batch_id: string | null
  max_marks: number
  is_published: boolean
  public_slug: string
  created_at: string
  updated_at: string
  batch?: Batch
  exam_results?: ExamResult[]
}

export type ExamResult = {
  id: string
  exam_id: string
  student_id: string
  marks_obtained: number | null
  comment: string | null
  created_at: string
  updated_at: string
  student?: Student
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJ.placeholder'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJ.placeholder'

// Browser client (for client components)
export const createBrowserClient = () =>
  createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Server client (for API routes - uses service role)
export const createServerClient = () =>
  createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

// Format date to IST
export const toIST = (date: Date = new Date()) => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const todayIST = () => {
  const now = new Date()
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
  return `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, '0')}-${String(ist.getDate()).padStart(2, '0')}`
}

export const formatDateDisplay = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d} ${months[parseInt(m)-1]} ${y}`
}

export const WHATSAPP_LINK = `https://wa.me/919871494741?text=${encodeURIComponent('Hello Mam, I want to talk about my kids Maths Classes.')}`
