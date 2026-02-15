

# GTV Weekly Tracker — Implementation Plan

## Overview
A minimal, monochrome single-user SPA for weekly evidence tracking, daily anchor execution, and weekly commitments. Lovable Cloud provides magic link authentication and database persistence. Week runs Monday → Sunday.

---

## Authentication
- Magic link sign-in only (email: freemanmadudili@gmail.com)
- Single user — no roles or profiles needed
- Protected routes behind auth

---

## Navigation
- Collapsible sidebar with links:
  - **Dashboard** — current week overview
  - **Weekly Evidence** — primary + secondary evidence
  - **Weekly Commitments** — open source, skill drill, applications
  - **Daily Execution** — 7 day cards with day-specific structures
  - **Previous Weeks** — archive list
  - **Sunday Planning** — conditionally visible only on Sundays

---

## Pages

### 1. Dashboard
- Shows current week range (Mon–Sun)
- Anchor completion progress (e.g., "8/14 completed")
- Primary evidence status (defined/built/documented/linked)
- Weekly commitments progress summary
- Quick links to Evidence, Commitments, and Daily Execution

### 2. Weekly Evidence
- **Primary Evidence** (always 1): Title, Description, Links, 4-item checklist (Defined, Built, Documented, Link Added)
- **Secondary Evidence** (0–2): Same structure, hard cap at 2
- **Weekly Focus**: "This week's anchor work is ONLY about" text field + constraints/notes

### 3. Weekly Commitments
- **Open Source Contribution**: Title, repo link, completed checkbox
- **Skill Drill**: 3 session checkboxes
- **Applications Session**: Single completed checkbox + optional notes

### 4. Daily Execution
- 7 collapsible day cards, each showing only that day's structure:
  - **Monday/Wednesday**: Main anchor block + daily commitment (25 min)
  - **Tuesday/Thursday**: Main anchor + 2 mini anchors + daily commitment (45 min) + skill drill (30 min)
  - **Friday**: Main anchor + 1 required mini + 1 optional mini + daily commitment (45 min) + skill drill (30 min)
  - **Saturday**: Main anchor + 1 mini anchor (no commitments)
  - **Sunday**: Main anchor only (lightest day)
- Each anchor block: completed checkbox, title, checklist items, notes

### 5. Sunday Planning (visible Sundays only)
- Plan next week's primary evidence, secondary evidence (max 2), weekly focus
- Plan open source contribution
- Reset skill drill (3 sessions) and applications session
- On save: archives current week, creates new week for Monday

### 6. Previous Weeks
- List of past weeks showing: date range, primary evidence status, anchors completed, commitments completed
- Click any week to open it fully (all fields editable)

---

## Database (Lovable Cloud / Supabase)
- **weeks** table: stores week data (start date, evidence, focus, commitments)
- **daily_entries** table: stores per-day anchor blocks and commitment completions
- All data tied to the authenticated user
- Full editability of past weeks

---

## Design
- Monochrome palette (black, white, greys)
- Clean typography, generous whitespace
- Mobile-responsive layout
- No charts, no gamification, no timers, no notifications
- Goal: logging takes under 3 minutes per session

