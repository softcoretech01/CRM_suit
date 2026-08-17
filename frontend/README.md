# Techspire CRM — Enterprise React Prototype

A production-quality, interactive frontend prototype of an enterprise CRM, built to the
**Techspire CRM Volume 1 + Volume 2** functional requirements. Light, premium, spacious
enterprise design system — no dark mode, no generic admin-dashboard look.

## Tech stack
- **React 18** + **Vite**
- **React Router v6**
- **Bootstrap 5** + custom Techspire design system (CSS variables, `src/styles/`)
- **Bootstrap Icons**
- **Recharts** for dashboard charts
- React Context for shared state (`CrmContext`) + toast system (`ToastContext`)
- Realistic Indian business mock data (`src/data/mockData.js`)

## Getting started
```bash
npm install
npm run dev
```
Then open http://localhost:5173. The app opens on the **Login** screen — use the
pre-filled demo credentials and any captcha text to sign in.

```bash
npm run build      # production build
npm run preview    # preview the production build
```

## What's included (Volume 1 + 2)
- **Login** — light split-screen, password / OTP / captcha / forgot-password UI
- **Executive Dashboard** — 8 KPI cards, pipeline funnel, lead-source donut, revenue
  forecast, salesperson leaderboard, upcoming & overdue panels
- **Leads** — table + Kanban, KPI strip, filters, 6-step creation wizard with duplicate
  detection, lead detail with scoring, assignment, and conversion flow
- **Companies** — list + **Company 360°** profile (tabs, KPIs, timeline)
- **Contacts** — list + contact profile with relationship indicators & timeline
- **Opportunities** — list + pipeline Kanban with stage probabilities, opportunity detail
  with stage tracker and close/loss-reason flow
- **Activities** — list / calendar / timeline, call & meeting logging, **Follow-up** buckets
- **Sales Pipeline** — funnel with stage counts, values, probability, conversion & loss reasons
- **Masters** — one reusable metadata-driven screen for all 13 masters
- **Administration** — User Management (multi-section form), Roles & Permission Matrix
- **Profile** — Profile / Security / Activity / Preferences
- Reusable design system: DataTable, KanbanBoard, Timeline, Drawer, Modal, Toasts,
  StatCards, Badges, Skeletons, Empty/Error states

## Project structure
```
src/
 ├── components/
 │   ├── layout/     AppShell, Sidebar, Topbar, GlobalSearch
 │   ├── common/     DataTable, KanbanBoard, Timeline, Overlay, Ui, PageHeader, PageParts
 │   └── crm/        LeadModals (assign / convert / duplicate)
 ├── context/        CrmContext, ToastContext
 ├── data/           mockData
 ├── pages/          dashboard, leads, companies, contacts, opportunities,
 │                   activities, pipeline, masters, users, roles, profile, auth
 ├── styles/         theme.css, layout.css
 └── utils/          format helpers
```

## Scope
Volume 1 & Volume 2 only. Volume 3–5 features (quotations, documents, email/WhatsApp
automation, AI, advanced reports, backend/API) are intentionally **not** implemented and,
where referenced, appear as clearly-marked "coming in a later phase" placeholders.

> Prototype only — all data is mock and in-memory; refreshing resets state.
