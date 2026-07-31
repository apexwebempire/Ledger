import { openDB } from 'idb'

const DB_NAME = 'ledger-db'
const DB_VERSION = 1

export const STORES = {
  transactions: 'transactions', // {id, type: income|expense|savings, bucket: need|want|save (expenses only), amount, category, note, date}
  goals: 'goals',               // {id, name, targetAmount, savedAmount, category, done, createdAt}
  categories: 'categories',     // {id, name, kind: income|expense}
  budgets: 'budgets',           // {id, category, monthlyLimit}
  meta: 'meta'                  // key/value app settings (currency, ratio, etc)
}

let dbPromise

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.transactions)) {
          const s = db.createObjectStore(STORES.transactions, { keyPath: 'id' })
          s.createIndex('date', 'date')
          s.createIndex('type', 'type')
        }
        if (!db.objectStoreNames.contains(STORES.goals)) {
          db.createObjectStore(STORES.goals, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.categories)) {
          db.createObjectStore(STORES.categories, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.budgets)) {
          db.createObjectStore(STORES.budgets, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORES.meta)) {
          db.createObjectStore(STORES.meta, { keyPath: 'key' })
        }
      }
    })
  }
  return dbPromise
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export async function addRecord(store, record) {
  const db = await getDB()
  const withId = { id: record.id || uid(), ...record }
  await db.put(store, withId)
  return withId
}

export async function updateRecord(store, record) {
  const db = await getDB()
  await db.put(store, record)
  return record
}

export async function deleteRecord(store, id) {
  const db = await getDB()
  await db.delete(store, id)
}

export async function getAll(store) {
  const db = await getDB()
  return db.getAll(store)
}

export async function getMeta(key, fallback) {
  const db = await getDB()
  const rec = await db.get(STORES.meta, key)
  return rec ? rec.value : fallback
}

export async function setMeta(key, value) {
  const db = await getDB()
  await db.put(STORES.meta, { key, value })
}

export const DEFAULT_CATEGORIES = [
  { id: 'cat-salary', name: 'Salary', kind: 'income' },
  { id: 'cat-freelance', name: 'Freelance', kind: 'income' },
  { id: 'cat-other-income', name: 'Other Income', kind: 'income' },
  { id: 'cat-rent', name: 'Rent', kind: 'expense' },
  { id: 'cat-food', name: 'Food', kind: 'expense' },
  { id: 'cat-transport', name: 'Transport', kind: 'expense' },
  { id: 'cat-utilities', name: 'Utilities', kind: 'expense' },
  { id: 'cat-subscriptions', name: 'Subscriptions', kind: 'expense' },
  { id: 'cat-health', name: 'Health', kind: 'expense' },
  { id: 'cat-shopping', name: 'Shopping', kind: 'expense' },
  { id: 'cat-other-expense', name: 'Other', kind: 'expense' }
]

export async function ensureDefaultCategories() {
  const existing = await getAll(STORES.categories)
  if (existing.length === 0) {
    const db = await getDB()
    const tx = db.transaction(STORES.categories, 'readwrite')
    await Promise.all(DEFAULT_CATEGORIES.map(c => tx.store.put(c)))
    await tx.done
  }
}

export async function exportAllData() {
  const [transactions, goals, categories, budgets] = await Promise.all([
    getAll(STORES.transactions),
    getAll(STORES.goals),
    getAll(STORES.categories),
    getAll(STORES.budgets)
  ])
  const currency = await getMeta('currency', 'USD')
  const ratio = await getMeta('ratio', { need: 50, want: 30, save: 20 })
  return { exportedAt: new Date().toISOString(), currency, ratio, transactions, goals, categories, budgets }
}

export async function importAllData(data) {
  const db = await getDB()
  const stores = [STORES.transactions, STORES.goals, STORES.categories, STORES.budgets]
  for (const store of stores) {
    const tx = db.transaction(store, 'readwrite')
    await tx.store.clear()
    await tx.done
  }
  for (const [store, records] of [
    [STORES.transactions, data.transactions || []],
    [STORES.goals, data.goals || []],
    [STORES.categories, data.categories || []],
    [STORES.budgets, data.budgets || []]
  ]) {
    const tx = db.transaction(store, 'readwrite')
    await Promise.all(records.map(r => tx.store.put(r)))
    await tx.done
  }
  if (data.currency) await setMeta('currency', data.currency)
  if (data.ratio) await setMeta('ratio', data.ratio)
}
