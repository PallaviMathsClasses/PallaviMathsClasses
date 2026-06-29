import { createServerClient, formatDateDisplay, WHATSAPP_LINK } from '@/lib/supabase'
import { notFound } from 'next/navigation'

export const revalidate = 60

export default async function StudentSheetPage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient()

  const { data: student } = await supabase
    .from('students')
    .select('*, batch:batches(*)')
    .eq('public_slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!student) notFound()

  // Attendance last 90 days
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)
  const cutoffStr = cutoff.toISOString().split('T')[0]

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', student.id)
    .gte('date', cutoffStr)
    .order('date', { ascending: false })

  const attendanceList = attendance || []
  const presentCount = attendanceList.filter(a => a.present).length
  const totalMarked = attendanceList.length
  const attendancePct = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : null

  // Exam results
  const { data: examResults } = await supabase
    .from('exam_results')
    .select('*, exam:exams(*)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })

  const results = (examResults || []).filter(r => r.exam?.is_published)
  const scoredResults = results.filter(r => r.marks_obtained != null)
  const avgPct = scoredResults.length
    ? Math.round(
        scoredResults.reduce((a, r) => a + ((r.marks_obtained || 0) / (r.exam?.max_marks || 100)) * 100, 0)
        / scoredResults.length
      )
    : null

  const getGrade = (marks: number | null, max: number) => {
    if (marks == null) return '—'
    const pct = (marks / max) * 100
    if (pct >= 90) return 'A+'
    if (pct >= 75) return 'A'
    if (pct >= 60) return 'B'
    if (pct >= 45) return 'C'
    if (pct >= 33) return 'D'
    return 'F'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-600">
        <div className="max-w-2xl mx-auto px-4 py-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="text-sm text-orange-200">Pallavi Maths Classes</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">
                {student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{student.name}</h1>
              <div className="text-sm text-orange-200">
                Class {student.class_name}
                {student.batch ? ` · ${student.batch.name}` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="card text-center">
            <div className={`text-3xl font-extrabold ${
              attendancePct == null ? 'text-gray-400' :
              attendancePct >= 75 ? 'text-green-600' :
              attendancePct >= 50 ? 'text-orange-500' : 'text-red-600'
            }`}>
              {attendancePct != null ? `${attendancePct}%` : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Attendance (90 days)</div>
            <div className="text-xs text-gray-300 mt-0.5">{presentCount}/{totalMarked} classes</div>
          </div>
          <div className="card text-center">
            <div className={`text-3xl font-extrabold ${
              avgPct == null ? 'text-gray-400' :
              avgPct >= 75 ? 'text-green-600' :
              avgPct >= 50 ? 'text-orange-500' : 'text-red-600'
            }`}>
              {avgPct != null ? `${avgPct}%` : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Average score</div>
            <div className="text-xs text-gray-300 mt-0.5">{results.length} test{results.length !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Attendance section */}
        <div className="mb-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Attendance — last 90 days</h2>
          {attendanceList.length === 0 ? (
            <div className="card text-center py-6 text-gray-400 text-sm">No attendance recorded yet</div>
          ) : (
            <div className="card overflow-hidden p-0">
              {/* Calendar dots */}
              <div className="p-4 border-b border-gray-50">
                <div className="flex flex-wrap gap-1">
                  {attendanceList.slice(0, 60).map(a => (
                    <div
                      key={a.id}
                      title={`${formatDateDisplay(a.date)} — ${a.present ? 'Present' : 'Absent'}`}
                      className={`w-4 h-4 rounded-sm ${a.present ? 'bg-green-400' : 'bg-red-300'}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Present</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-300 inline-block" /> Absent</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
                {attendanceList.slice(0, 20).map(a => (
                  <div key={a.id} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{formatDateDisplay(a.date)}</span>
                    <span className={`badge ${a.present ? 'badge-green' : 'badge-red'}`}>
                      {a.present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Test results section */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Test results</h2>
          {results.length === 0 ? (
            <div className="card text-center py-6 text-gray-400 text-sm">No test results yet</div>
          ) : (
            <div className="space-y-2">
              {results.map(result => {
                const pct = result.marks_obtained != null
                  ? Math.round((result.marks_obtained / (result.exam?.max_marks || 100)) * 100)
                  : null
                const grade = getGrade(result.marks_obtained, result.exam?.max_marks || 100)
                return (
                  <div key={result.id} className="card">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{result.exam?.test_name}</div>
                        <div className="text-xs text-gray-400">{result.exam?.test_date ? formatDateDisplay(result.exam.test_date) : ''}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-gray-900">
                          {result.marks_obtained ?? '—'}<span className="text-gray-400 text-xs font-normal">/{result.exam?.max_marks}</span>
                        </div>
                        <div className={`text-sm font-bold ${
                          grade === 'A+' || grade === 'A' ? 'text-green-600' :
                          grade === 'B' ? 'text-blue-600' :
                          grade === 'C' ? 'text-orange-500' : 'text-red-600'
                        }`}>{grade}</div>
                      </div>
                    </div>
                    {pct != null && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 75 ? 'bg-green-400' : pct >= 45 ? 'bg-orange-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                    {result.comment && (
                      <div className="mt-1.5 text-xs text-gray-400 italic">{result.comment}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-100 pt-5">
          <div className="text-xs text-gray-400 mb-3">
            Student sheet · Pallavi Maths Classes · View only
          </div>
          <a href={WHATSAPP_LINK} className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
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
