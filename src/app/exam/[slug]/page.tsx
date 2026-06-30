import { createServerClient, formatDateDisplay, type ExamResult, type Student } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 60 // ISR - revalidate every minute

export default async function ExamPage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient()

  const { data: exam } = await supabase
    .from('exams')
    .select('*, batch:batches(*)')
    .eq('public_slug', params.slug)
    .eq('is_published', true)
    .single()

  if (!exam) notFound()

  const { data: resultsRaw } = await supabase
    .from('exam_results')
    .select('*, student:students(*)')
    .eq('exam_id', exam.id)
    .order('marks_obtained', { ascending: false, nullsFirst: false })

  const results = resultsRaw || []
  const totalStudents = results.length
  const marksData = results.filter(r => r.marks_obtained != null)
  const avg = marksData.length
    ? Math.round(marksData.reduce((a, r) => a + (r.marks_obtained || 0), 0) / marksData.length)
    : null
  const highest = marksData.length ? Math.max(...marksData.map(r => r.marks_obtained || 0)) : null
  const passCount = marksData.filter(r => (r.marks_obtained || 0) >= exam.max_marks * 0.33).length

  const getGrade = (marks: number | null, max: number): { grade: string; color: string } => {
    if (marks == null) return { grade: '—', color: 'text-gray-400' }
    const pct = (marks / max) * 100
    if (pct >= 90) return { grade: 'A+', color: 'text-green-700' }
    if (pct >= 75) return { grade: 'A', color: 'text-green-600' }
    if (pct >= 60) return { grade: 'B', color: 'text-blue-600' }
    if (pct >= 45) return { grade: 'C', color: 'text-orange-500' }
    if (pct >= 33) return { grade: 'D', color: 'text-orange-600' }
    return { grade: 'F', color: 'text-red-600' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">Pallavi Mam Maths Classes</div>
            <div className="text-xs text-gray-400">Dr. Pallavi Agarwal</div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Exam info */}
        <div className="card mb-5">
          <div className="flex items-start gap-3">
            <div className="text-3xl">📝</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{exam.test_name}</h1>
              <div className="text-sm text-gray-500 mt-1">
                {formatDateDisplay(exam.test_date)} ·
                Class {exam.class_name}
                {exam.batch ? ` · ${exam.batch.name}` : ''} ·
                Max: {exam.max_marks} marks
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {marksData.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="card text-center">
              <div className="text-2xl font-bold text-brand-600">{avg}</div>
              <div className="text-xs text-gray-400 mt-0.5">Class avg</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">{highest}</div>
              <div className="text-xs text-gray-400 mt-0.5">Highest</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-indigo-600">{passCount}/{totalStudents}</div>
              <div className="text-xs text-gray-400 mt-0.5">Passed</div>
            </div>
          </div>
        )}

        {/* Results table */}
        <div className="card overflow-hidden p-0">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Student</div>
              <div className="col-span-3 text-right">Marks</div>
              <div className="col-span-1 text-center">%</div>
              <div className="col-span-2 text-center">Grade</div>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {results.map((result, idx) => {
              const pct = result.marks_obtained != null
                ? Math.round((result.marks_obtained / exam.max_marks) * 100)
                : null
              const { grade, color } = getGrade(result.marks_obtained, exam.max_marks)
              return (
                <div key={result.id} className="px-5 py-3">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-sm text-gray-400">{idx + 1}</div>
                    <div className="col-span-5">
                      <div className="font-medium text-gray-900 text-sm">{result.student?.name}</div>
                      {result.comment && (
                        <div className="text-xs text-gray-400 mt-0.5">{result.comment}</div>
                      )}
                    </div>
                    <div className="col-span-3 text-right">
                      <span className="font-semibold text-gray-900">
                        {result.marks_obtained ?? '—'}
                      </span>
                      <span className="text-gray-400 text-xs">/{exam.max_marks}</span>
                    </div>
                    <div className="col-span-1 text-center text-xs text-gray-500">
                      {pct != null ? `${pct}%` : '—'}
                    </div>
                    <div className={`col-span-2 text-center font-bold ${color}`}>
                      {grade}
                    </div>
                  </div>
                  {pct != null && (
                    <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 75 ? 'bg-green-400' : pct >= 45 ? 'bg-orange-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-400">
            Result published by Pallavi Mam Maths Classes
          </div>
        </div>
      </div>
    </div>
  )
}
