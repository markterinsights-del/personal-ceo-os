# Personal CEO OS — Gamified Growth Dashboard

A premium, dark-themed single-page application designed for **Rajswa**, a Marketing & Growth Analyst at the CIIC Incubator. Built as an executive command center with gamification mechanics layered over real operational tools.

## What It Does

- **Executive Header**: Displays user profile, current XP level (scales every 1,000 XP), and a real-time XP progress bar. Status badges show live system states (Claude AI, GitHub sync, analytics, CIIC pipeline).
- **Capability Radar**: A Recharts radar chart plotting 5 skill vectors — Marketing & Growth, AI Automation, Data Analytics, Development, and Operations/Systems. Values update live when missions are completed.
- **Daily Missions Engine**: Interactive task list with realistic growth objectives. Each mission has an XP reward and a skill vector tag. Completing a mission instantly updates the global XP bar, runs level-up logic, and expands the radar chart.
- **Opportunity Kanban**: Three-lane pipeline board (Backlog → Incubation → Executing). Cards can be moved between lanes, deleted, or created inline.
- **Weekly Business Review**: KPI logger for Ad Spend, Revenue, and Leads. Calculates a live Marketing ROI Factor and renders a strategic AI diagnostic report.

## Tech Stack

- **React 19** + **TanStack Start / Router** — file-based routing
- **Vite** — build tooling with HMR
- **Tailwind CSS v4** — utility-first styling
- **Recharts** — radar chart visualization
- **TypeScript** — full type safety
- **Netlify** — hosting + edge deployment

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
