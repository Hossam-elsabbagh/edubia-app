# Edubia React Instructor Hub — Version 1.2.0

React + Vite application configured to continue using the existing Edubia Supabase database.

## Main features

- Multi-instructor sign-up and sign-in with private Supabase RLS workspaces.
- Animated weekly schedule with Paid, Cover, and Free sessions.
- Busy / Available controls for empty time slots.
- Student details and full lesson feedback management.
- Daily FOLLOW UP attendance and monthly Excel reports.
- Read-only coordinator link with:
  - Complete Busy / Available schedule status.
  - Weekly available-time reminder.
  - All student feedback with student filtering.
  - Direct feedback PDF download.
- Direct PDF creation without browser pop-ups.
- New high-resolution Edubia logo and clearer Manrope typography.

## Existing database

For an existing upgraded database, run this once in Supabase SQL Editor:

```text
RUN_ONCE_COORDINATOR_FEATURES_UPGRADE.sql
```

This only adds coordinator read functions and does not delete or update existing business rows.

If the database has never received the React multi-instructor upgrade, run:

```text
RUN_ONCE_SAFE_DATABASE_UPGRADE.sql
```

Do not run `database.sql` on the old database. It is only for a brand-new empty Supabase project.

## Local run

```bash
npm install
npm run dev
```

## Vercel

```text
Framework: Vite
Build command: npm run build
Output directory: dist
Root directory: ./
```

See `COORDINATOR_UPDATE_AR.md` for the complete Arabic deployment instructions.
