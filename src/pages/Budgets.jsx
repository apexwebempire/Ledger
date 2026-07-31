import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { formatMoney, isSameMonth } from '../utils'

export default function Budgets() {
  const { budgets, categories, transactions, currency, setBudget, removeBudget } = useData()
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')

  const expenseCats = categories.filter(c => c.kind === 'expense')
  const monthTx = useMemo(() => transactions.filter(t => t.type === 'expense' && isSameMonth(t.date)), [transactions])

  const submit = async (e) => {
    e.preventDefault()
    const cat = category || expenseCats[0]?.name
    if (!cat || !limit || Number(limit) <= 0) return
    await setBudget(cat, Number(limit))
    setCategory(''); setLimit('')
  }

  return (
    <>
      <p className="section-title">Budgets</p>

      <form onSubmit={submit} className="card">
        <p className="card-title">Set a monthly limit</p>
        <div className="field">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">{expenseCats[0]?.name || 'Select category'}</option>
            {expenseCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Monthly limit</label>
          <input type="number" inputMode="decimal" min="0" step="0.01" value={limit} onChange={e => setLimit(e.target.value)} placeholder="0.00" />
        </div>
        <button className="btn-primary" type="submit">Save budget</button>
      </form>

      {budgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="glyph">▤</div>
            <p>No budgets set yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="card-title">This month</p>
          {budgets.map(b => {
            const spent = monthTx.filter(t => t.category === b.category).reduce((s, t) => s + t.amount, 0)
            const pct = Math.min(100, Math.round((spent / b.monthlyLimit) * 100)) || 0
            const over = spent > b.monthlyLimit
            return (
              <div key={b.id} className="mt-16">
                <div className="row-between">
                  <span>{b.category}</span>
                  <span className="muted">{formatMoney(spent, currency)} / {formatMoney(b.monthlyLimit, currency)}</span>
                </div>
                <div className="progress-track">
                  <div className={`progress-fill ${over ? 'brick' : 'sage'}`} style={{ width: `${pct}%` }} />
                </div>
                <button
                  className="btn-danger"
                  style={{ fontSize: 11, marginTop: 6 }}
                  onClick={() => removeBudget(b.id)}
                >
                  Remove budget
                </button>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
