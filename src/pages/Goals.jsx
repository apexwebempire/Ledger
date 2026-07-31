import { useState } from 'react'
import { useData } from '../context/DataContext'
import { formatMoney } from '../utils'

export default function Goals() {
  const { goals, currency, addGoal, contributeToGoal, removeGoal } = useData()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [category, setCategory] = useState('Investment')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !target || Number(target) <= 0) return
    await addGoal({ name: name.trim(), targetAmount: Number(target), category })
    setName(''); setTarget(''); setShowForm(false)
  }

  const addFunds = (goal) => {
    const amt = prompt(`Add how much toward "${goal.name}"?`)
    const n = Number(amt)
    if (amt && n > 0) contributeToGoal(goal, n)
  }

  const active = goals.filter(g => !g.done)
  const done = goals.filter(g => g.done)

  return (
    <>
      <div className="row-between">
        <p className="section-title">Goals & wishlist</p>
        <button className="btn-secondary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ New goal'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card">
          <div className="field">
            <label>Goal name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New laptop, index fund" autoFocus />
          </div>
          <div className="field">
            <label>Target price / amount</label>
            <input type="number" inputMode="decimal" min="0" step="0.01" value={target} onChange={e => setTarget(e.target.value)} placeholder="0.00" />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option>Investment</option>
              <option>Gadget</option>
              <option>Travel</option>
              <option>Emergency fund</option>
              <option>Other</option>
            </select>
          </div>
          <button className="btn-primary" type="submit">Create goal</button>
        </form>
      )}

      {active.length === 0 && !showForm && (
        <div className="card">
          <div className="empty-state">
            <div className="glyph">◎</div>
            <p>No goals yet. Add something you're saving toward.</p>
          </div>
        </div>
      )}

      {active.map(g => {
        const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100))
        return (
          <div className="card goal-card" key={g.id}>
            <div className="goal-head">
              <span className="goal-name">{g.name}</span>
              <span className="pill save">{g.category}</span>
            </div>
            <div className="goal-target">{formatMoney(g.savedAmount, currency)} of {formatMoney(g.targetAmount, currency)}</div>
            <div className="progress-track">
              <div className="progress-fill gold" style={{ width: `${pct}%` }} />
            </div>
            <div className="goal-actions">
              <button onClick={() => addFunds(g)}>Add funds</button>
              <button className="btn-danger" onClick={() => { if (confirm('Delete this goal?')) removeGoal(g.id) }}>Delete</button>
            </div>
          </div>
        )
      })}

      {done.length > 0 && (
        <div className="card">
          <p className="card-title">Achieved</p>
          {done.map(g => (
            <div className="tx-row" key={g.id}>
              <div className="tx-main">
                <div className="tx-icon savings">✓</div>
                <div className="tx-info">
                  <div className="tx-cat">{g.name}</div>
                </div>
              </div>
              <div className="tx-amount" style={{ color: 'var(--sage)' }}>{formatMoney(g.targetAmount, currency)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
