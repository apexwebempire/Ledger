const TABS = [
  { key: 'dashboard', label: 'Overview', icon: '◈' },
  { key: 'transactions', label: 'Ledger', icon: '☰' },
  { key: 'goals', label: 'Goals', icon: '◎' },
  { key: 'budgets', label: 'Budgets', icon: '▤' },
  { key: 'settings', label: 'Settings', icon: '⚙' }
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <button
          key={t.key}
          className={`nav-item${active === t.key ? ' active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          <span className="nav-icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
