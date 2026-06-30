'use client'

import { useState, useEffect, useCallback } from 'react'

type StudentWithFees = {
  id: string
  name: string
  class_name: string
  fees: Record<string, { amount: number | null; paid: boolean; id: string } | null>
}

const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']
const SHORT_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

export default function FeeHistoryPage() {
  const [students, setStudents] = useState<StudentWithFees[]>([])
  const [filterClass, setFilterClass] = useState('all')
  const [saving, setSaving] = useState(false)
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set())
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSummary, setShowSummary] = useState(false)

  const loadData = useCallback(async () => {
    const url = filterClass === 'all' ? '/api/fees' : `/api/fees?class=${filterClass}`
    const res = await fetch(url)
    const data = await res.json()
    setStudents(data.students || [])
  }, [filterClass])

  useEffect(() => { loadData() }, [loadData])

  const handleAmountChange = (studentId: string, month: string, value: string) => {
    const num = value === '' ? null : parseFloat(value)
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s
      const existing = s.fees[month]
      return {
        ...s,
        fees: {
          ...s.fees,
          [month]: existing
            ? { ...existing, amount: num, paid: num !== null ? existing.paid : false }
            : num !== null ? { amount: num, paid: false, id: '' } : null,
        },
      }
    }))
    setEditedCells(prev => { const n = new Set(Array.from(prev)); n.add(`${studentId}-${month}`); return n })
  }

  const handlePaidToggle = (studentId: string, month: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s
      const existing = s.fees[month]
      if (!existing) return s // can't toggle paid if no amount
      return {
        ...s,
        fees: {
          ...s.fees,
          [month]: { ...existing, paid: !existing.paid },
        },
      }
    }))
    setEditedCells(prev => { const n = new Set(Array.from(prev)); n.add(`${studentId}-${month}`); return n })
  }

  const handleSave = async () => {
    setSaving(true)
    const records: { studentId: string; month: string; amount: number | null; paid: boolean }[] = []

    for (const student of students) {
      for (const month of MONTHS) {
        const fee = student.fees[month]
        if (editedCells.has(`${student.id}-${month}`) && fee) {
          records.push({
            studentId: student.id,
            month,
            amount: fee.amount,
            paid: fee.paid,
          })
        }
      }
    }

    if (records.length > 0) {
      await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      })
    }

    setEditedCells(new Set())
    setSaving(false)
    setLastSaved(new Date())
  }

  const unsavedCount = editedCells.size

  // Summary calculations
  const totalCollected = students.reduce((sum, s) => {
    return sum + MONTHS.reduce((mSum, month) => {
      const fee = s.fees[month]
      return mSum + (fee && fee.paid && fee.amount ? fee.amount : 0)
    }, 0)
  }, 0)

  const totalExpected = students.reduce((sum, s) => {
    return sum + MONTHS.reduce((mSum, month) => {
      const fee = s.fees[month]
      return mSum + (fee && fee.amount ? fee.amount : 0)
    }, 0)
  }, 0)

  return (
    <div className="pb-24">
      {/* Filter + Actions */}
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
        <button
          onClick={() => setShowSummary(!showSummary)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            showSummary ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-indigo-600'
          }`}
        >
          {showSummary ? '📊 Hide Summary' : '📊 Summary'}
        </button>
      </div>

      {/* Summary Card */}
      {showSummary && (
        <div className="card mb-4 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{students.length}</div>
              <div className="text-xs text-gray-500">Students</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-green-600">₹{totalCollected.toLocaleString('en-IN')}</div>
              <div className="text-xs text-gray-500">Collected</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-orange-500">₹{(totalExpected - totalCollected).toLocaleString('en-IN')}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved indicator + Save */}
      {unsavedCount > 0 && (
        <div className="fixed bottom-20 left-4 right-4 max-w-2xl mx-auto z-40">
          <div className="bg-brand-600 text-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-xl shadow-orange-200">
            <span className="text-sm font-medium">{unsavedCount} unsaved change{unsavedCount > 1 ? 's' : ''}</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-brand-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-orange-50 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {lastSaved && unsavedCount === 0 && (
        <div className="text-xs text-green-600 mb-3">✓ Saved {lastSaved.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
      )}

      {/* Count */}
      <div className="text-sm text-gray-500 mb-3">
        {students.length} student{students.length !== 1 ? 's' : ''}
      </div>

      {students.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">💰</div>
          <div className="font-medium text-gray-700">No students yet</div>
          <div className="text-sm text-gray-400 mt-1">Add students first to track fees</div>
        </div>
      ) : (
        /* Fee Table - scrollable */
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[140px]">
                    Student Name
                  </th>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky left-[140px] bg-gray-50 z-10 min-w-[60px]">
                    Class
                  </th>
                  {SHORT_MONTHS.map((m, i) => (
                    <th key={m} className={`text-center px-1.5 py-2.5 text-xs font-semibold uppercase tracking-wider min-w-[70px] ${
                      i < 3 ? 'text-green-600' : i >= 9 ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {m}
                    </th>
                  ))}
                  <th className="text-center px-2 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider min-w-[70px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student) => {
                  const totalPaid = MONTHS.reduce((sum, month) => {
                    const fee = student.fees[month]
                    return sum + (fee && fee.paid && fee.amount ? fee.amount : 0)
                  }, 0)
                  const totalAmount = MONTHS.reduce((sum, month) => {
                    const fee = student.fees[month]
                    return sum + (fee && fee.amount ? fee.amount : 0)
                  }, 0)
                  const allPaid = totalAmount > 0 && totalPaid === totalAmount

                  return (
                    <tr key={student.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                        <div className="truncate max-w-[130px]" title={student.name}>{student.name}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500 sticky left-[140px] bg-white z-10">
                        {student.class_name}
                      </td>
                      {MONTHS.map((month) => {
                        const fee = student.fees[month]
                        const isEdited = editedCells.has(`${student.id}-${month}`)
                        return (
                          <td key={month} className="px-1 py-1.5 text-center">
                            <div className={`rounded-lg p-1 transition-colors ${isEdited ? 'bg-orange-50 ring-1 ring-orange-200' : ''} ${fee?.paid ? 'bg-green-50' : ''}`}>
                              <input
                                type="number"
                                placeholder="—"
                                value={fee?.amount ?? ''}
                                onChange={e => handleAmountChange(student.id, month, e.target.value)}
                                className="w-full text-center text-xs bg-transparent border-0 outline-none text-gray-700 placeholder-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                onClick={() => handlePaidToggle(student.id, month)}
                                disabled={!fee?.amount}
                                className={`w-full text-[10px] mt-0.5 rounded py-0.5 font-medium transition-colors ${
                                  fee?.paid
                                    ? 'bg-green-500 text-white'
                                    : fee?.amount
                                      ? 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                                      : 'bg-transparent text-transparent'
                                }`}
                              >
                                {fee?.paid ? '✓ Paid' : fee?.amount ? 'Mark Paid' : ''}
                              </button>
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-2 py-2 text-center">
                        <div className={`text-sm font-bold ${allPaid ? 'text-green-600' : totalPaid > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
                          ₹{totalPaid.toLocaleString('en-IN')}
                        </div>
                        {totalAmount > 0 && !allPaid && (
                          <div className="text-[10px] text-gray-400">of ₹{totalAmount.toLocaleString('en-IN')}</div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}