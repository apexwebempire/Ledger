import { useRef, useState } from 'react'
import { useData } from '../context/DataContext'

export default function Settings() {
  const { currency, updateCurrency, ratio, updateRatio, categories, addCategory, removeCategory, backup, restore } = useData()
  const [localRatio, setLocalRatio] = useState(ratio)
  const fileInput = useRef(null)
  const [newCatName, setNewCatName] = useState('')
  const [newCatKind, setNewCatKind] = useState('expense')

  const saveRatio = async () => {
    const sum = Number(localRatio.need) + Number(localRatio.want) + Number(localRatio.save)
    if (sum !== 100) { alert('Ratio must add up to 100%'); return }
    await updateRatio({ need: Number(localRatio.need), want: Number(localRatio.want), save: Number(localRatio.save) })
  }

  const doExport = async () => {
    const data = await backup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ledger-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (confirm('This replaces all current data with the backup file. Continue?')) {
        await restore(data)
        alert('Data restored.')
      }
    } catch {
      alert('Could not read that file — make sure it is a Ledger backup JSON.')
    }
    e.target.value = ''
  }

  const submitCategory = async (e) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    await addCategory({ id: `cat-${Date.now()}`, name: newCatName.trim(), kind: newCatKind })
    setNewCatName('')
  }

  return (
    <>
      <p className="section-title">Settings</p>

      <div className="card">
        <p className="card-title">Currency</p>
        <select value={currency} onChange={e => updateCurrency(e.target.value)}>
          <option value="USD">USD ($)</option>
          <option value="NGN">NGN (₦)</option>
          <option value="GBP">GBP (£)</option>
          <option value="EUR">EUR (€)</option>
        </select>
      </div>

      <div className="card">
        <p className="card-title">Needs / Wants / Savings target</p>
        <div className="field">
          <label>Needs %</label>
          <input type="number" min="0" max="100" value={localRatio.need} onChange={e => setLocalRatio(r => ({ ...r, need: e.target.value }))} />
        </div>
        <div className="field">
          <label>Wants %</label>
          <input type="number" min="0" max="100" value={localRatio.want} onChange={e => setLocalRatio(r => ({ ...r, want: e.target.value }))} />
        </div>
        <div className="field">
          <label>Savings %</label>
          <input type="number" min="0" max="100" value={localRatio.save} onChange={e => setLocalRatio(r => ({ ...r, save: e.target.value }))} />
        </div>
        <button className="btn-secondary" onClick={saveRatio}>Save split</button>
      </div>

      <div className="card">
        <p className="card-title">Categories</p>
        {categories.map(c => (
          <div className="row-between mt-8" key={c.id}>
            <span>{c.name} <span className="muted">· {c.kind}</span></span>
            <button className="btn-danger" style={{ fontSize: 12 }} onClick={() => removeCategory(c.id)}>Remove</button>
          </div>
        ))}
        <form onSubmit={submitCategory} className="mt-16">
          <div className="field">
            <label>New category name</label>
            <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Gifts" />
          </div>
          <div className="field">
            <label>Kind</label>
            <div className="segmented">
              <button type="button" className={newCatKind === 'income' ? 'active income' : ''} onClick={() => setNewCatKind('income')}>Income</button>
              <button type="button" className={newCatKind === 'expense' ? 'active expense' : ''} onClick={() => setNewCatKind('expense')}>Expense</button>
            </div>
          </div>
          <button className="btn-secondary" type="submit">Add category</button>
        </form>
      </div>

      <div className="card">
        <p className="card-title">Backup & restore</p>
        <p className="muted">All data lives only on this device. Export a backup file regularly, or before switching phones.</p>
        <button className="btn-secondary mt-16" onClick={doExport}>Export backup (JSON)</button>
        <button className="btn-secondary mt-16" onClick={() => fileInput.current.click()}>Import backup</button>
        <input ref={fileInput} type="file" accept="application/json" style={{ display: 'none' }} onChange={doImport} />
      </div>
    </>
  )
}
