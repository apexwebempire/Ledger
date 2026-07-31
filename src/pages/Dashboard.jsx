import { useMemo } from 'react'
import { useData } from '../context/DataContext'
import { formatAmount, formatMoney, isSameMonth, monthLabel, shortDate } from '../utils'

export default function Dashboard() {
  const { transactions, goals, budgets, currency, ratio } = useData()

  const monthTx = useMemo(() => transactions.filter(t => isSameMonth(t.date)), [transactions])

  const totals = useMemo(() => {
    let income = 0, expense = 0, savings = 0, need = 0, want = 0
    for (const t of monthTx) {
      if (t.type === 'income') income += t.amount
      else if (t.type === 'savings') savings += t.amount
      else if (t.type === 'expense') {
        expense += t.amount
        if (t.bucket === 'need') need += t.amount
        else want += t.amount
      }
    }
    return { income, expense, savings, need, want }
  }, [monthTx])

  const allTimeBalance = useMemo(() => {
    return transactions.reduce((sum, t) => {
      if (t.type === 'income') return sum + t.amount
      if (t.type === 'expense') return sum - t.amount
      if (t.type === 'savings') return sum - t.amount
      return sum
    }, 0)
  }, [transactions])

  const spendable = totals.need + totals.want
  const spendTotal = spendable + totals.savings || 1
  const needPct = Math.round((totals.need / spendTotal) * 100)
  const wantPct = Math.round((totals.want / spendTotal) * 100)
  const savePct = Math.max(0, 100 - needPct - wantPct)

  const bal = formatAmount(allTimeBalance, currency)
  const recent = transactions.slice(0, 5)

  const activeGoals = goals.filter(g => !g.done).slice(0, 2)

  return (
    <>
      <div className="card">
        <p className="card-title">Balance</p>
        <div className="balance-figure">
          {bal.whole}<span className="cents">.{bal.cents}</span>
        </div>
        <div className="balance-sub">
          <div className="item">
            <div className="label">Income</div>
            <div className="value positive">{formatMoney(totals.income, currency)}</div>
          </div>
          <div className="item">
            <div className="label">Expenses</div>
            <div className="value negative">{formatMoney(totals.expense, currency)}</div>
          </div>
          <div className="item">
            <div className="label">Saved</div>
            <div className="value neutral">{formatMoney(totals.savings, currency)}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="card-title">{monthLabel()} · Needs / Wants / Savings</p>
        <div className="ratio-bar">
          <div className="ratio-seg need" style={{ width: `${needPct}%` }} />
          <div className="ratio-seg want" style={{ width: `${wantPct}%` }} />
          <div className="ratio-seg save" style={{ width: `${savePct}%` }} />
        </div>
        <div className="ratio-legend">
          <span><span className="dot" style={{ background: 'var(--brick)' }} />Needs {needPct}%</span>
          <span><span className="dot" style={{ background: 'var(--gold)' }} />Wants {wantPct}%</span>
          <span><span className="dot" style={{ background: 'var(--sage)' }} />Saved {savePct}%</span>
        </div>
        <p className="muted mt-8">Target split — {ratio.need}/{ratio.want}/{ratio.save}. Adjust in Settings.</p>
      </div>

      {budgets.length > 0 && (
        <div className="card">
          <p className="card-title">Budget snapshot</p>
          {budgets.slice(0, 3).map(b => {
            const spent = monthTx
              .filter(t => t.type === 'expense' && t.category === b.category)
              .reduce((s, t) => s + t.amount, 0)
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
              </div>
            )
          })}
        </div>
      )}

      {activeGoals.length > 0 && (
        <div className="card">
          <p className="card-title">Goals in progress</p>
          {activeGoals.map(g => {
            const pct = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100))
            return (
              <div key={g.id} className="mt-16">
                <div className="row-between">
                  <span>{g.name}</span>
                  <span className="muted">{formatMoney(g.savedAmount, currency)} / {formatMoney(g.targetAmount, currency)}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill gold" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="card">
        <p className="card-title">Recent activity</p>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="glyph">—</div>
            <p>No entries yet. Tap + to add your first one.</p>
          </div>
        ) : (
          recent.map(t => (
            <div className="tx-row" key={t.id}>
              <div className="tx-main">
                <div className={`tx-icon ${t.type}`}>
                  {t.type === 'income' ? '↑' : t.type === 'savings' ? '◎' : '↓'}
                </div>
                <div className="tx-info">
                  <div className="tx-cat">{t.category}</div>
                  {t.note && <div className="tx-note">{t.note}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="tx-amount" style={{ color: t.type === 'expense' ? 'var(--brick)' : t.type === 'savings' ? 'var(--gold)' : 'var(--sage)' }}>
                  {t.type === 'expense' ? '-' : '+'}{formatMoney(t.amount, currency)}
                </div>
                <div className="tx-date">{shortDate(t.date)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
