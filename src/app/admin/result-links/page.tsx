'use client'

import { useState, useEffect } from 'react'
import { formatDateDisplay } from '@/lib/supabase'

export default function ResultLinksPage() {
  const [exams, setExams] = useState<any[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/exams?published=true')
      .then(r => r.json())
      .then(d => setExams(d.exams || []))
  }, [])

  const getUrl = (slug: string) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/exam/${slug}`

  const copy = async (slug: string) => {
    await navigator.clipboard.writeText(getUrl(slug))
    setCopied(slug)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="pb-24">
      <p className="text-sm text-gray-500 mb-5">All published result links in one place. Copy links to share with students and parents.</p>

      {exams.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🔗</div>
          <div className="font-medium text-gray-700">No published exams yet</div>
          <div className="text-sm text-gray-400 mt-1">Create and publish an exam to see links here</div>
          <a href="/admin/create-exam" className="btn-primary mt-4 inline-block">Create exam</a>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam: any) => {
            const url = getUrl(exam.public_slug)
            return (
              <div key={exam.id} className="card">
                <div className="mb-3">
                  <div className="font-semibold text-gray-900">{exam.test_name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Class {exam.class_name}
                    {exam.batch ? ` · ${exam.batch.name}` : ''}
                    {' · '}{formatDateDisplay(exam.test_date)}
                  </div>
                </div>
                {/* Link preview */}
                <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
                  <div className="text-xs font-mono text-gray-500 truncate">{url}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copy(exam.public_slug)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      copied === exam.public_slug
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {copied === exam.public_slug ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 flex-shrink-0 bg-indigo-50 border border-indigo-200 text-indigo-600 py-2 rounded-lg text-xs font-medium flex items-center justify-center hover:bg-indigo-100 transition-colors"
                    title="View result page"
                  >
                    👁
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}