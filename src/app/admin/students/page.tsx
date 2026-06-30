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
