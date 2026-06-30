'use client'

import { useState, useEffect } from 'react'
import { todayIST, type Student, type Batch } from '@/lib/supabase'

type ResultEntry = {
  studentId: string
  studentName: string
  marksObtained: string
  comment: string
}

export default function CreateExamPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [testName, setTestName] = useState('')
  const [testDate, setTestDate] = useState(todayIST())
  const [className, setClassName] = useState('')
  const [batchId, setBatchId] = useState('')
  const [maxMarks, setMaxMarks] = useState('100')
  const [results, setResults] = useState<ResultEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [published, setPublished] = useState<{ slug: string; url: string } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [view, setView] = useState<'create' | 'history'>('create')

  useEffect(() => {
    fetch('/api/batches').then(r => r.json()).then(d => setBatches(d.batches || []))
    fetch('/api/exams').then(r => r.json()).then(d => setHistory(d.exams || []))
  }, [])

  useEffect(() => {
    if (!batchId) { setStudents([]); setResults([]); return }
    fetch(`/api/students?batchId=${batchId}&active=true`)
      .then(r => r.json())
      .then(d => {
        const s: Student[] = d.students || []
        setStudents(s)
        setResults(s.map(st => ({ studentId: st.id, studentName: st.name, marksObtained: '', comment: '' })))
      })
  }, [batchId])

  const filteredBatches = className ? batches.filter(b => b.class_name === className) : batches

  const updateResult = (idx: number, field: keyof ResultEntry, value: string) => {
    setResults(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }

  const handlePublish = async () => {
    if (!testName || !testDate || !className || !batchId) {
      alert('Please fill in test name, date, class, and batch.')
      return
    }
    setSaving(true)
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testName, testDate, className, batchId,
        maxMarks: parseFloat(maxMarks) || 100,
        results: results.filter(r => r.marksObtained !== ''),
        publish: true,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (data.exam) {
      const url = `${window.location.origin}/exam/${data.exam.public_slug}`
      setPublished({ slug: data.exam.public_slug, url })
      fetch('/api/exams').then(r => r.json()).then(d => setHistory(d.exams || []))
    }
  }

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  if (published) {
    return (
      <div className="pb-24">
        <div className="card text-center py-10 mb-4">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Result Published!</h2>
          <p className="text-gray-500 text-sm mb-6">Share this link with students and parents</p>
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="text-xs text-gray-400 mb-1">Public link</div>
            <div className="font-mono text-sm text-gray-700 break-all">{published.url}</div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => copyLink(published.url)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <span>📋</span> Copy link
            </button>
            <button
              onClick={() => { setPublished(null); setTestName(''); setTestDate(todayIST()); setClassName(''); setBatchId(''); setResults([]) }}
              className="btn-ghost w-full"
            >
              Create another exam
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
        {(['create', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              view === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {tab === 'create' ? '📝 New Exam' : '📚 History'}
          </button>
        ))}
      </div>

      {view === 'create' ? (
        <div className="space-y-4">
          {/* Exam details */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900">Exam details</h3>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Test name</label>
              <input
                type="text"
                placeholder="e.g. Chapter 3 — Trigonometry Test"
                value={testName}
                onChange={e => setTestName(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Date</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={e => setTestDate(e.target.value)}
                  max={todayIST()}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Max marks</label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={e => setMaxMarks(e.target.value)}
                  className="input-field"
                  placeholder="100"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Class</label>
              <select
                value={className}
                onChange={e => { setClassName(e.target.value); setBatchId('') }}
                className="select-field"
              >
                <option value="">Select class</option>
                {['9th', '10th', '11th', '12th'].map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            {className && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Batch</label>
                <select
                  value={batchId}
                  onChange={e => setBatchId(e.target.value)}
                  className="select-field"
                >
                  <option value="">Select batch</option>
                  {filteredBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}{b.timing ? ` (${b.timing})` : ''}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Marks entry */}
          {results.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Enter marks</h3>
              <div className="space-y-3">
                {results.map((result, idx) => (
                  <div key={result.studentId} className="border border-gray-100 rounded-xl p-3">
                    <div className="font-medium text-gray-900 mb-2">{result.studentName}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Marks (/{maxMarks})</label>
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          placeholder="—"
                          value={result.marksObtained}
                          onChange={e => updateResult(idx, 'marksObtained', e.target.value)}
                          className="input-field text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Comment (optional)</label>
                        <input
                          type="text"
                          placeholder="Good work…"
                          value={result.comment}
                          onChange={e => updateResult(idx, 'comment', e.target.value)}
                          className="input-field"
                        />
                      </div>
                    </div>
                    {result.marksObtained && (
                      <div className="mt-1.5 text-xs text-right">
                        <span className={`font-semibold ${
                          (parseFloat(result.marksObtained) / parseFloat(maxMarks)) >= 0.75 ? 'text-green-600' :
                          (parseFloat(result.marksObtained) / parseFloat(maxMarks)) >= 0.5 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {Math.round((parseFloat(result.marksObtained) / parseFloat(maxMarks)) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={saving || !testName || !batchId}
            className="btn-primary w-full text-base py-4 shadow-lg shadow-orange-200"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing…
              </span>
            ) : '🚀 Publish & Get Link'}
          </button>
          <p className="text-xs text-center text-gray-400">Creates a public link you can share with parents</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="card text-center py-10">
              <div className="text-4xl mb-3">📝</div>
              <div className="font-medium text-gray-700">No exams yet</div>
            </div>
          ) : (
            history.map((exam: any) => {
              const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/exam/${exam.public_slug}`
              return (
                <div key={exam.id} className="card">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{exam.test_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Class {exam.class_name} · {exam.test_date}
                      </div>
                    </div>
                    <span className={`badge ${exam.is_published ? 'badge-green' : 'badge-orange'}`}>
                      {exam.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {exam.is_published && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyLink(url)}
                        className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors"
                      >
                        📋 Copy link
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
