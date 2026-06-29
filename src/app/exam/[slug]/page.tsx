import { createServerClient, formatDateDisplay, WHATSAPP_LINK, type ExamResult, type Student } from '@/lib/supabase'
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
            <div className="font-bold text-gray-900 text-sm leading-tight">Pallavi Maths Classes</div>
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
            Result published by Pallavi Maths Classes
          </div>
          <a href={WHATSAPP_LINK} className="inline-flex items-center gap-2 mt-3 text-sm text-green-600 font-medium hover:text-green-700">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Ask about admissions
          </a>
        </div>
      </div>
    </div>
  )
}
