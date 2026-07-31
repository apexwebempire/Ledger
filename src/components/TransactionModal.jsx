import { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import { todayISO } from '../utils'

export default function TransactionModal({ onClose }) {
  const { categories, addCategory, addTransaction } = useData()
  const [type, setType] = useState('expense')
  const [bucket, setBucket] = useState('need')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [newCat, setNewCat] = useState('')

  const relevantCats = useMemo(
    () => categories.filter(c => c.kind === (type === 'savings' ? 'expense' : type)),
    [categories, type]
  )

  const submit = async (e) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    let cat = category || relevantCats[0]?.name || 'Other'
    if (newCat.trim()) {
      const created = await addCategory({
        id: `cat-${Date.now()}`,
        name: newCat.trim(),
        kind: type === 'savings' ? 'expense' : type
      })
      cat = newCat.trim()
    }
    await addTransaction({
      type,
      bucket: type === 'expense' ? bucket : type === 'savings' ? 'save' : undefined,
      amount: Number(amount),
      category: cat,
      note,
      date
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Add entry</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Type</label>
            <div className="segmented">
              {['income', 'expense', 'savings'].map(t => (
                <button
                  type="button"
                  key={t}
                  className={`${type === t ? 'active ' + t : ''}`}
                  onClick={() => { setType(t); setCategory('') }}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {type === 'expense' && (
            <div className="field">
              <label>Bucket</label>
              <div className="segmented">
                {['need', 'want'].map(b => (
                  <button
                    type="button"
                    key={b}
                    className={bucket === b ? 'active expense' : ''}
                    onClick={() => setBucket(b)}
                  >
                    {b[0].toUpperCase() + b.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field">
            <label>Amount</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">
                {relevantCats[0] ? `${relevantCats[0].name} (default)` : 'Select category'}
              </option>
              {relevantCats.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Or add new category</label>
            <input
              type="text"
              placeholder="e.g. Gifts"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Note (optional)</label>
            <input
              type="text"
              placeholder="What was this for?"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <button className="btn-primary" type="submit">Save entry</button>
        </form>
      </div>
    </div>
  )
}
