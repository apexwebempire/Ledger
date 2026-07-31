import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  STORES, addRecord, updateRecord, deleteRecord, getAll,
  getMeta, setMeta, ensureDefaultCategories, exportAllData, importAllData
} from '../db'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [currency, setCurrency] = useState('USD')
  const [ratio, setRatio] = useState({ need: 50, want: 30, save: 20 })
  const [ready, setReady] = useState(false)

  const reload = useCallback(async () => {
    const [t, g, c, b, cur, r] = await Promise.all([
      getAll(STORES.transactions),
      getAll(STORES.goals),
      getAll(STORES.categories),
      getAll(STORES.budgets),
      getMeta('currency', 'USD'),
      getMeta('ratio', { need: 50, want: 30, save: 20 })
    ])
    setTransactions(t.sort((a, b2) => new Date(b2.date) - new Date(a.date)))
    setGoals(g)
    setCategories(c)
    setBudgets(b)
    setCurrency(cur)
    setRatio(r)
  }, [])

  useEffect(() => {
    ;(async () => {
      await ensureDefaultCategories()
      await reload()
      setReady(true)
    })()
  }, [reload])

  const addTransaction = async (record) => {
    await addRecord(STORES.transactions, record)
    await reload()
  }
  const removeTransaction = async (id) => {
    await deleteRecord(STORES.transactions, id)
    await reload()
  }

  const addGoal = async (goal) => {
    await addRecord(STORES.goals, { savedAmount: 0, done: false, createdAt: new Date().toISOString(), ...goal })
    await reload()
  }
  const contributeToGoal = async (goal, amount) => {
    const updated = { ...goal, savedAmount: (goal.savedAmount || 0) + amount }
    if (updated.savedAmount >= updated.targetAmount) updated.done = true
    await updateRecord(STORES.goals, updated)
    await reload()
  }
  const removeGoal = async (id) => {
    await deleteRecord(STORES.goals, id)
    await reload()
  }

  const addCategory = async (cat) => {
    await addRecord(STORES.categories, cat)
    await reload()
  }
  const removeCategory = async (id) => {
    await deleteRecord(STORES.categories, id)
    await reload()
  }

  const setBudget = async (category, monthlyLimit) => {
    const existing = budgets.find(b => b.category === category)
    if (existing) {
      await updateRecord(STORES.budgets, { ...existing, monthlyLimit })
    } else {
      await addRecord(STORES.budgets, { category, monthlyLimit })
    }
    await reload()
  }
  const removeBudget = async (id) => {
    await deleteRecord(STORES.budgets, id)
    await reload()
  }

  const updateCurrency = async (val) => {
    await setMeta('currency', val)
    setCurrency(val)
  }
  const updateRatio = async (val) => {
    await setMeta('ratio', val)
    setRatio(val)
  }

  const backup = async () => exportAllData()
  const restore = async (data) => {
    await importAllData(data)
    await reload()
  }

  return (
    <DataContext.Provider value={{
      ready, transactions, goals, categories, budgets, currency, ratio,
      addTransaction, removeTransaction,
      addGoal, contributeToGoal, removeGoal,
      addCategory, removeCategory,
      setBudget, removeBudget,
      updateCurrency, updateRatio,
      backup, restore
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
