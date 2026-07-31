import { useState } from 'react'
import { useData } from './context/DataContext'
import BottomNav from './components/BottomNav'
import TransactionModal from './components/TransactionModal'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Goals from './pages/Goals'
import Budgets from './pages/Budgets'
import Settings from './pages/Settings'

const TITLES = {
  dashboard: 'Ledger',
  transactions: 'Ledger',
  goals: 'Ledger',
  budgets: 'Ledger',
  settings: 'Ledger'
}

export default function App() {
  const { ready } = useData()
  const [tab, setTab] = useState('dashboard')
  const [showAdd, setShowAdd] = useState(false)

  if (!ready) {
    return (
      <div className="app-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p className="muted">Loading your ledger…</p>
      </div>
    )
  }

  return (
    <>
      <header className="app-header">
        <h1>{TITLES[tab]}</h1>
        <span className="date-tag">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      </header>

      <main className="app-main">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'transactions' && <Transactions />}
        {tab === 'goals' && <Goals />}
        {tab === 'budgets' && <Budgets />}
        {tab === 'settings' && <Settings />}
      </main>

      {(tab === 'dashboard' || tab === 'transactions') && (
        <button className="fab" onClick={() => setShowAdd(true)} aria-label="Add entry">+</button>
      )}

      <BottomNav active={tab} onChange={setTab} />

      {showAdd && <TransactionModal onClose={() => setShowAdd(false)} />}
    </>
  )
}
