'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { type Student, type Batch } from '@/lib/supabase'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [newName, setNewName] = useState('')
  const [newClass, setNewClass] = useState('')
  const [newBatch, setNewBatch] = useState('')
  const [newParent, setNewParent] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterClass, setFilterClass] = useState('all')
  const searchParams = useSearchParams()
  const dragIdx = useRef<number | null>(null)

  useEffect(() => {
    if (searchParams.get('new') === 'true') setShowAdd(true)
    loadData()
  }, [])

  const loadData = async () => {
    const [sr, br] = await Promise.all([
      fetch('/api/students?active=true'),
      fetch('/api/batches'),
    ])
    const [sd, bd] = await Promise.all([sr.json(), br.json()])
    setStudents(sd.students || [])
    setBatches(bd.batches || [])
  }

  const filteredStudents = filterClass === 'all'
    ? students
    : students.filter(s => s.class_name === filterClass)

  const filteredBatches = newClass ? batches.filter(b => b.class_name === newClass) : batches

  const handleSave = async () => {
    if (!newName || !newClass) return
    setSaving(true)
    const body = editStudent
      ? { id: editStudent.id, name: newName, class_name: newClass, batch_id: newBatch || null, parent_name: newParent, phone: newPhone }
      : { name: newName, class_name: newClass, batch_id: newBatch || null, parent_name: newParent, phone: newPhone }
    await fetch('/api/students', {
      method: editStudent ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    setShowAdd(false)
    setEditStudent(null)
    resetForm()
    loadData()
  }

  const resetForm = () => {
    setNewName(''); setNewClass(''); setNewBatch(''); setNewParent(''); setNewPhone('')
  }

  const startEdit = (s: Student) => {
    setEditStudent(s)
    setNewName(s.name)
    setNewClass(s.class_name)
    setNewBatch(s.batch_id || '')
    setNewParent(s.parent_name || '')
    setNewPhone(s.phone || '')
    setShowAdd(true)
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('Remove this student?')) return
    await fetch(`/api/students?id=${id}`, { method: 'DELETE' })
    loadData()
  }

  const studentSheetUrl = (slug: string) =>
    `${typeof window !== 'undefined' ? window.location.origin : ''}/student/${slug}`

  return (
    <div className="pb-24">
      {/* Add/Edit modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{editStudent ? 'Edit student' : 'Add student'}</h3>
              <button onClick={() => { setShowAdd(false); setEditStudent(null); resetForm() }} className="btn-ghost">✕</button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Student name *"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="input-field"
                autoFocus
              />
              <select
                value={newClass}
                onChange={e => { setNewClass(e.target.value); setNewBatch('') }}
                className="select-field"
              >
                <option value="">Select class *</option>
                {['9th', '10th', '11th', '12th'].map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
              {newClass && (
                <select
                  value={newBatch}
                  onChange={e => setNewBatch(e.target.value)}
                  className="select-field"
                >
                  <option value="">Select batch</option>
                  {filteredBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}{b.timing ? ` (${b.timing})` : ''}</option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder="Parent name (optional)"
                value={newParent}
                onChange={e => setNewParent(e.target.value)}
                className="input-field"
              />
              <input
                type="tel"
                placeholder="Parent phone (optional)"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="input-field"
              />
              <button
                onClick={handleSave}
                disabled={saving || !newName || !newClass}
                className="btn-primary w-full"
              >
                {saving ? 'Saving…' : editStudent ? 'Save changes' : 'Add student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
        <button
          onClick={() => setFilterClass('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            filterClass === 'all' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}
        >
          All
        </button>
        {['9th', '10th', '11th', '12th'].map(c => (
          <button
            key={c}
            onClick={() => setFilterClass(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterClass === c ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            Class {c}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="text-sm text-gray-500 mb-3">
        {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
      </div>

      {/* Student list */}
      <div className="space-y-2">
        {filteredStudents.map((student) => {
          const url = studentSheetUrl(student.public_slug)
          return (
            <div key={student.id} className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-deep-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-deep-700 font-bold text-sm">
                    {student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{student.name}</div>
                  <div className="text-xs text-gray-400">
                    Class {student.class_name}
                    {student.batch && ` · ${student.batch.name}`}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => { navigator.clipboard.writeText(url) }}
                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs"
                    title="Copy student sheet link"
                  >
                    🔗
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(`📚 Student Performance Sheet\n${student.name}\n${url}`)
                      window.open(`https://wa.me/?text=${text}`, '_blank')
                    }}
                    className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors"
                    title="Share on WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => startEdit(student)}
                    className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeactivate(student.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {filteredStudents.length === 0 && (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">👤</div>
            <div className="font-medium text-gray-700">No students yet</div>
            <div className="text-sm text-gray-400 mt-1">Tap + to add your first student</div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { resetForm(); setEditStudent(null); setShowAdd(true) }}
        className="fixed bottom-24 right-4 w-14 h-14 bg-brand-600 text-white rounded-full shadow-xl
                   flex items-center justify-center text-2xl hover:bg-brand-700 active:scale-95 transition-all"
        aria-label="Add student"
      >
        +
      </button>
    </div>
  )
}
