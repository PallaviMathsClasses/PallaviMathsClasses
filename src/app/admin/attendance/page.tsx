'use client'

import { useState, useEffect, useCallback } from 'react'
import { todayIST, formatDateDisplay, type Student, type Batch } from '@/lib/supabase'

type AttendanceRecord = {
  studentId: string
  present: boolean | null
}

export default function AttendancePage() {
  const [date, setDate] = useState(todayIST())
  const [batches, setBatches] = useState<Batch[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, boolean | null>>({})
  const [selectedBatch, setSelectedBatch] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [studentsRes, attendanceRes, batchesRes] = await Promise.all([
      fetch('/api/students?active=true'),
      fetch(`/api/attendance?date=${date}`),
      fetch('/api/batches'),
    ])
    const [studentsData, attendanceData, batchesData] = await Promise.all([
      studentsRes.json(),
      attendanceRes.json(),
      batchesRes.json(),
    ])

    setStudents(studentsData.students || [])
    setBatches(batchesData.batches || [])

    const attMap: Record<string, boolean | null> = {}
    ;(attendanceData.attendance || []).forEach((a: { student_id: string; present: boolean }) => {
      attMap[a.student_id] = a.present
    })
    setAttendance(attMap)
    setLoading(false)
  }, [date])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleAttendance = async (studentId: string) => {
    const current = attendance[studentId]
    const next = current === true ? false : current === false ? null : true
    setAttendance(prev => ({ ...prev, [studentId]: next }))

    if (next === null) return // Don't save null state

    setSaving(studentId)
    await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, date, present: next }),
    })
    setSaving(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const markAll = async (present: boolean) => {
    const filtered = filteredStudents
    const updates: Record<string, boolean> = {}
    filtered.forEach(s => { updates[s.id] = present })
    setAttendance(prev => ({ ...prev, ...updates }))

    await fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: filtered.map(s => ({ studentId: s.id, date, present })),
      }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const filteredStudents = selectedBatch === 'all'
    ? students
    : students.filter(s => s.batch_id === selectedBatch)

  const presentCount = filteredStudents.filter(s => attendance[s.id] === true).length
  const absentCount = filteredStudents.filter(s => attendance[s.id] === false).length
  const unmarkedCount = filteredStudents.filter(s => attendance[s.id] == null).length

  const adjustDate = (days: number) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    setDate(`${y}-${m}-${dd}`)
  }

  const isToday = date === todayIST()

  return (
    <div className="pb-24">
      {/* Date navigator */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => adjustDate(-1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <div className="font-bold text-gray-900">{formatDateDisplay(date)}</div>
            {isToday && <div className="text-xs text-brand-600 font-medium">Today</div>}
          </div>
          <button
            onClick={() => adjustDate(1)}
            disabled={isToday}
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          max={todayIST()}
          className="input-field text-sm"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{presentCount}</div>
          <div className="text-xs text-green-600 mt-0.5">Present</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{absentCount}</div>
          <div className="text-xs text-red-500 mt-0.5">Absent</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-gray-500">{unmarkedCount}</div>
          <div className="text-xs text-gray-400 mt-0.5">Unmarked</div>
        </div>
      </div>

      {/* Batch filter */}
      <div className="mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedBatch('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              selectedBatch === 'all' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            All students
          </button>
          {batches.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBatch(b.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedBatch === b.id ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {b.class_name} · {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick mark all */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => markAll(true)}
          className="flex-1 bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
        >
          ✓ All Present
        </button>
        <button
          onClick={() => markAll(false)}
          className="flex-1 bg-red-50 border border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
        >
          ✗ All Absent
        </button>
      </div>

      {/* Student list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">👥</div>
          <div className="font-medium text-gray-700">No students yet</div>
          <div className="text-sm text-gray-400 mt-1">Add students from the Students tab</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredStudents.map(student => {
            const state = attendance[student.id]
            return (
              <div
                key={student.id}
                className={`card flex items-center justify-between transition-all duration-150 ${
                  state === true ? 'border-green-200 bg-green-50/50' :
                  state === false ? 'border-red-200 bg-red-50/50' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{student.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Class {student.class_name}
                    {student.batch && ` · ${student.batch.name}`}
                  </div>
                </div>
                <button
                  onClick={() => toggleAttendance(student.id)}
                  disabled={saving === student.id}
                  className={`present-btn ml-4 flex-shrink-0 ${
                    state === true ? 'present' :
                    state === false ? 'absent' : 'unmarked'
                  }`}
                  aria-label={state === true ? 'Present' : state === false ? 'Absent' : 'Tap to mark'}
                >
                  {saving === student.id ? '…' :
                   state === true ? '✓' :
                   state === false ? '✗' : '?'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Saved indicator */}
      {saved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-fade-in">
          ✓ Saved
        </div>
      )}

      {/* Add student FAB */}
      <a
        href="/admin/students?new=true"
        className="fixed bottom-24 right-4 w-12 h-12 bg-brand-600 text-white rounded-full shadow-lg
                   flex items-center justify-center text-2xl hover:bg-brand-700 active:scale-95 transition-all"
        aria-label="Add student"
      >
        +
      </a>

      {/* Attendance URL note */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <div className="text-xs text-gray-500">
          <span className="font-medium">Quick link to this page:</span>{' '}
          <span className="font-mono text-gray-700 break-all">{typeof window !== 'undefined' ? window.location.origin : ''}/admin/attendance</span>
        </div>
      </div>
    </div>
  )
}
