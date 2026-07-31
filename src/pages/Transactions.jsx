import { useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { formatMoney, shortDate } from '../utils'

const FILTERS = ['all', 'income', 'expense', 'savings']

export default function Transactions() {
  const { transactions, currency, removeTransaction } = useData()
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions
    return transactions.filter(t => t.type === filter)
  }, [transactions, filter])

  return (
    <>
      <p className="section-title">Ledger</p>
      <div className="segmented mt-16" style={{ marginBottom: 14 }}>
        {FILTERS.map(f => (
          <button
            key={f}
            className={filter === f ? `active ${f === 'all' ? '' : f}` : ''}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">—</div>
            <p>Nothing here yet.</p>
          </div>
        ) : (
          filtered.map(t => (
            <div className="tx-row" key={t.id}>
              <div className="tx-main">
                <div className={`tx-icon ${t.type}`}>
                  {t.type === 'income' ? '↑' : t.type === 'savings' ? '◎' : '↓'}
                </div>
                <div className="tx-info">
                  <div className="tx-cat">
                    {t.category}
                    {t.bucket && <span className={`pill ${t.bucket}`} style={{ marginLeft: 8 }}>{t.bucket}</span>}
                  </div>
                  {t.note && <div className="tx-note">{t.note}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="tx-amount" style={{ color: t.type === 'expense' ? 'var(--brick)' : t.type === 'savings' ? 'var(--gold)' : 'var(--sage)' }}>
                  {t.type === 'expense' ? '-' : '+'}{formatMoney(t.amount, currency)}
                </div>
                <div className="tx-date" style={{ cursor: 'pointer' }} onClick={() => { if (confirm('Delete this entry?')) removeTransaction(t.id) }}>
                  {shortDate(t.date)} · ✕
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
