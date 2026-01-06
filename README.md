# Sentry Debug Demo App

A Next.js dashboard app designed to demonstrate the difference between Sentry Seer and Claude Code for debugging errors.

## Thesis

Both tools have access to the same Sentry error data (stack traces, breadcrumbs, tags, etc.). The key differentiator is that Claude Code also has **full codebase context**, allowing it to:

1. Trace errors to their root cause (not just where they surface)
2. Understand data flow across files
3. Read related code to understand intent
4. Actually implement fixes

## The App

A simple analytics dashboard that displays:

- User metrics chart (line chart)
- Revenue breakdown (bar chart)
- Activity feed (table)
- Summary stats cards

Data flows through several layers:
```
API Route → Data Transformer → Hook → Component
```

## Intentional Bugs

Each bug is designed so the **stack trace points to the symptom, not the cause**.

### Bug 1: Type Mismatch Across Boundaries
- **Symptom**: Chart crashes with "Cannot read property 'map' of undefined"
- **Location of error**: `components/UserMetricsChart.tsx`
- **Actual cause**: `lib/transformers.ts` returns wrong shape when API returns empty array
- **Why codebase context helps**: Need to see the transformer to understand the data contract

### Bug 2: Stale Closure in useEffect
- **Symptom**: Dashboard shows stale data after filter change
- **Location of error**: No error - just wrong behavior
- **Actual cause**: `hooks/useDashboardData.ts` has missing dependency in useEffect
- **Why codebase context helps**: Need to read the hook logic to spot the closure issue

### Bug 3: Null Propagation from Config
- **Symptom**: "Cannot read property 'toFixed' of undefined" in revenue display
- **Location of error**: `components/RevenueChart.tsx`
- **Actual cause**: `lib/config.ts` has environment variable that's undefined, cascades through
- **Why codebase context helps**: Need to trace where the value originates

### Bug 4: Race Condition in Parallel Fetches
- **Symptom**: Intermittent "Data mismatch" error or wrong totals displayed
- **Location of error**: `components/SummaryCards.tsx`
- **Actual cause**: `hooks/useDashboardData.ts` has race condition when fetching multiple endpoints
- **Why codebase context helps**: Need to see the async flow and understand timing

### Bug 5: Off-by-One in Date Handling
- **Symptom**: Chart shows data for wrong date range, or missing last day
- **Location of error**: Appears correct but data is wrong
- **Actual cause**: `lib/transformers.ts` uses `<` instead of `<=` when filtering dates
- **Why codebase context helps**: Need to read the filter logic and understand the date boundaries

## Demo Flow

1. Trigger each bug in the running app
2. Errors go to Sentry
3. Ask Seer to diagnose
4. Ask Claude Code (with Sentry skill) to diagnose
5. Compare: Does each tool identify the root cause? Can it suggest the correct fix?

## Tech Stack

- Next.js 14 (App Router)
- Recharts for charts
- Tailwind CSS for styling
- Sentry SDK for error tracking

## Setup

```bash
npm install
cp .env.example .env.local  # Add your Sentry DSN
npm run dev
```

## Triggering Bugs

Each bug can be triggered via the UI:

- Bug 1: Click "Load Empty Dataset" button
- Bug 2: Change date filter rapidly
- Bug 3: Toggle "Use Custom Config" setting
- Bug 4: Click "Refresh All" button repeatedly
- Bug 5: Select date range ending today
