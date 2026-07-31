# Edubia React Instructor Hub — GitHub/Vercel Update

React + Vite replacement for the original Edubia static app, configured to continue using the **same existing Supabase database**.

## Features

- Multi-instructor sign-up and sign-in.
- Private students and sessions for every instructor using Supabase RLS.
- Animated responsive dashboard.
- Student and session management.
- Clear **Details** button and full student profile/session overview.
- **Available / Busy** controls for every empty weekly time slot.
- Full session **Feedback** with scores, notes, edit/delete, print/PDF, and JSON export.
- Daily **FOLLOW UP** attendance with Attended/Absent radio buttons.
- Monthly Excel export with dates, days, student names, statuses, and Paid/Cover/Free summaries.
- Read-only coordinator link per instructor.
- Light and dark mode.

## Existing database upgrade

Do **not** run `database.sql` on the old database. Run this file once instead:

```text
RUN_ONCE_SAFE_DATABASE_UPGRADE.sql
```

The migration first copies the old business tables into a private `edubia_backup` schema and then upgrades the existing schema without deleting student/session data.

## Local run

```bash
npm install
npm run dev
```

## Vercel

Vercel detects Vite automatically. The included `vercel.json` defines the production build and SPA fallback.

```text
Build command: npm run build
Output directory: dist
Root directory: ./
```

See `FEATURE_UPDATE_AR.md` and `DEPLOY_GITHUB_VERCEL_AR.md` for the complete Arabic update steps.
