# AGENTS.md — Project Architecture Reference

## Overview

Personal CEO OS — a gamified growth dashboard SPA built with TanStack Start and deployed on Netlify. All application logic lives in `src/routes/index.tsx`. There is intentionally no complex file-splitting — this is a deliberate design choice to keep the compilation footprint minimal and the codebase self-contained.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start + TanStack Router v1 |
| Frontend | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts (radar chart) |
| Language | TypeScript 5 (strict) |
| Deployment | Netlify |

## Directory Structure

```
src/
  routes/
    __root.tsx      # HTML shell, Google Fonts imports (Syne, Space Grotesk, JetBrains Mono)
    index.tsx       # Entire application: all components, types, state, logic
  styles.css        # Tailwind import + minimal global overrides
```

## State Architecture

All state is managed with `useState` in the root `Dashboard` component and passed down as props.

| State        | Type                           | Description                              |
|--------------|--------------------------------|------------------------------------------|
| `xp`         | `number`                       | Global XP total; drives level calculation |
| `skills`     | `Record<SkillVector, number>`  | Radar chart values (0–100 per vector)    |
| `missions`   | `Mission[]`                    | Daily task list with completion status   |
| `kanban`     | `KanbanCard[]`                 | All cards across 3 lanes                 |

## Component Inventory

- `ExecutiveHeader` — Profile, XP bar, status badges
- `SkillRadar` — Recharts `RadarChart` + skill breakdown bars
- `MissionsEngine` + `MissionCard` — Task list with reactive completion
- `KanbanBoard` — Three-column board with add/delete/move per lane
- `WeeklyReview` — KPI form + ROI calculator + diagnostic output
- `LevelUpToast` — Fixed-position notification on level-up
- `GlassCard`, `SectionHeader`, `StatusBadge` — Shared UI primitives

## Skill Vectors

The `SkillVector` type maps to: `marketing | ai | data | dev | ops`. Each mission is tagged to a vector. On completion, the corresponding radar value increases by `SKILL_XP_GAINS[vector]` (capped at 100).

## Level System

`level = Math.floor(xp / 1000) + 1`. Level-up toast fires when the new computed level exceeds the previous. XP is additive and never decreases.

## Coding Conventions

- Tailwind utility classes for all styling (no CSS modules)
- Dynamic values (progress bar width, skill colors) use inline `style` props
- `useCallback` wraps all event handlers passed as props
- No `useEffect` — all state transitions are event-driven
- `font-mono` for data/numeric values; `Syne` for headings; `Space Grotesk` for body

## Non-Obvious Decisions

- **recharts over chart.js**: The template used chart.js, but recharts was chosen because its `RadarChart` component composes cleanly with React state without imperative canvas mutations.
- **Single route file**: Avoids multi-file import graphs; keeps the Netlify build output lean for a SPA.
- **No drag-and-drop library**: Kanban uses click-to-move to keep dependencies minimal and avoid mobile compatibility issues.
- **Diagnostic template is pure function**: `DIAGNOSTIC_TEMPLATE()` is a deterministic string function so the output is reproducible and testable without network calls.
