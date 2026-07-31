# Ledger — Personal Finance PWA

A mobile app for tracking income, expenses, savings, budgets, and purchase/investment goals — everything stored locally on your device only. No account, no cloud sync, no one else can see your data.

## Features

- **Dashboard** — total balance, income/expense/savings totals, this month's needs/wants/savings split, budget warnings, recent activity
- **History** — full transaction list, filterable by type, grouped by month
- **Goals / Wishlist** — save toward things you want to buy or invest in, track progress, mark as purchased
- **Insights** — month-by-month breakdown, spending by category, budget tracking per category
- **Settings** — currency, custom categories, and a JSON export/import so you always have a backup

## Run it locally first (optional, to try it in a browser)

You'll need Node.js installed (v18+) — https://nodejs.org

```bash
npm install
npm run dev
```

Open the printed localhost URL in your browser.

## Install it on your phone

A PWA needs to be served over https for your phone to let you install it (localhost on your own computer works for testing in a desktop browser, but your phone needs a real URL). The easiest free options:

### Option A — Vercel (recommended, ~2 minutes)
1. Push this folder to a GitHub repo (or use `npx vercel` directly from this folder without GitHub).
2. Go to vercel.com, sign in, click "Add New Project", import the repo.
3. Framework preset: Vite. Leave build settings as default (`npm run build`, output dir `dist`).
4. Deploy. You'll get a URL like `ledger-yourname.vercel.app`.

### Option B — Netlify Drop (no GitHub needed)
1. Run `npm run build` locally — this creates a `dist` folder.
2. Go to app.netlify.com/drop and drag the `dist` folder in.
3. You'll get a live URL instantly.

### Option C — GitHub Pages
1. Push the repo to GitHub.
2. Add `base: '/your-repo-name/'` to `vite.config.js` inside `defineConfig({...})`.
3. Run `npm run build`, then deploy the `dist` folder using GitHub Pages (Settings > Pages > deploy from a branch, or use the `gh-pages` npm package).

### Then, on your phone:
- iPhone (Safari): open the URL, tap the Share icon, then "Add to Home Screen".
- Android (Chrome): open the URL, tap the menu (three dots), then "Install app" (or you'll see an automatic "Add Ledger to Home screen" banner).

It'll then behave like a normal app: its own icon, opens full-screen, works offline after the first load.

## Your data

- Everything is stored in IndexedDB, on your phone only.
- Go to Settings > Backup > Export data regularly, especially before switching phones or clearing browser data — it downloads a .json file you can re-import anytime via Import data.
- Uninstalling the app or clearing site data will erase everything, so keep a backup if the data matters.

## Project structure

```
src/
  lib/         data layer (IndexedDB), formatting utilities, shared app state
  components/  bottom nav, add-transaction sheet
  screens/     Home, Transactions, Goals, Insights, Settings
```

Built with React + Vite, idb-keyval for storage, vite-plugin-pwa for the installable app shell, and lucide-react for icons.
