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

  const whatsapp = (slug: string, name: string) => {
    const url = getUrl(slug)
    const text = encodeURIComponent(`📊 *Test Result — ${name}*\n\nView results here: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="pb-24">
      <p className="text-sm text-gray-500 mb-5">All published result links in one place. Copy or share directly on WhatsApp.</p>

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
                  <button
                    onClick={() => whatsapp(exam.public_slug, exam.test_name)}
                    className="flex-1 bg-green-50 border border-green-200 text-green-700 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-green-100 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
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
