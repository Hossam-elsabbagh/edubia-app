# Edubia Schedule App V3 — Live Coordinator Link

This version is made for real deployment with a live coordinator link.

## What changed

- Admin page: `index.html`
  - Add students
  - Add sessions
  - Add feedback
  - See prices and calculations privately
  - Copy/Open coordinator link

- Coordinator page: `coordinator.html`
  - Opens directly from the public coordinator link
  - Read-only without requiring coordinator login
  - Shows schedule and feedback only
  - Does NOT show prices
  - Shows paid/free/cover status using colors
  - Shows Available time in week under the schedule
  - Auto-refreshes every 10 seconds
  - Download feedback as PDF or JSON with an optional From/To session range

- Data is stored in Supabase, not in local browser storage.
  This means when you update from the admin page, the coordinator page updates too.

---

## V4 behavior notes

- Opening the Vercel deployment root (`index.html`) shows the Admin Login / Create Admin Account page first. Admin sessions are not stored permanently in the browser.
- The `coordinator.html` link is public read-only and opens directly without asking the coordinator to login.
- Keep `config.js` unchanged when uploading this patch, because it contains your Supabase URL and anon key.
- Upload `edubia-logo.png` with the other files. The PDF report uses the exact logo image file provided by Edubia.

## Files

- `index.html` — Admin dashboard
- `coordinator.html` — Public coordinator read-only view
- `edubia-logo.png` — Exact Edubia logo image used in the report
- `styles.css` — White/simple styling
- `app.js` — Admin logic
- `coordinator.js` — Coordinator logic
- `config.js` — Supabase project URL and anon key
- `database.sql` — Database setup for new Supabase projects
- `database_update_existing_supabase.sql` — Patch for existing Supabase projects

---

## Setup Supabase

1. Create a free Supabase project.
2. Open Supabase SQL Editor.
3. Copy everything from `database.sql`.
4. Run it.
5. Open Project Settings > API.
6. Copy:
   - Project URL
   - anon public key
7. Open `config.js`.
8. Replace:

```js
const SUPABASE_URL = "PASTE_YOUR_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_SUPABASE_ANON_KEY_HERE";
```

with your real values.

---

## Create Admin Login

Option A:
- Open the deployed app.
- Use "Create Admin Account".
- Then login.

Option B:
- In Supabase, go to Authentication > Users.
- Add a user manually.
- Use that email/password in the admin page.

---

## Run locally

```bash
cd edubia_schedule_app_v3
python -m http.server 8000
```

Open admin page:

```text
http://localhost:8000
```

Open coordinator page:

```text
http://localhost:8000/coordinator.html
```

If Python command does not work:

```bash
python3 -m http.server 8000
```

---

## Deploy

Use Netlify or Vercel as a static website.

No build command is required.

After deployment:

- Admin link:
  `https://your-site-name.netlify.app`

- Coordinator link:
  `https://your-site-name.netlify.app/coordinator.html`

Send only the coordinator link to coordinators.

## PDF Student Reports

- A `Download` button was added beside each feedback student name in the coordinator feedback table.
- A `Download` button was also added to each student row in the admin students table.
- A `Delete` button was added to remove a student completely with all their sessions and feedback.
- The PDF is generated in the browser from the saved student feedback and schedule data, using `report.js`, `html2canvas`, and `jsPDF`.
- The downloaded file is automatically named with the student name, for example: `تقرير الطالب Ahmed — Edubia.pdf`.

---

## Vercel/Supabase Patch Notes

### Login fix

`app.js` now avoids running async Supabase calls directly inside `onAuthStateChange`. This prevents the login/session refresh from hanging after deployment or after reopening the site.

### Coordinator page changes

- The coordinator schedule now shows separate colors for:
  - Paid
  - Cover
  - Free
- The page now includes an **Available time in week** block under the schedule.
- The available block groups empty slots like:
  - Sunday: 2 PM, 4 PM, 7 PM
  - Monday: 3 PM, 4 PM, 5 PM

### Temporary session cleanup

- Paid sessions stay weekly and do not auto-delete.
- Cover and Free sessions are treated as one-day sessions.
- When a Cover/Free session is saved, the app stores `session_date` and `expires_at`.
- After `expires_at`, the cleanup function deletes only expired Cover/Free rows.

### Updating an existing Supabase project

If you already ran the old `database.sql`, open Supabase SQL Editor and run:

```sql
-- Copy and run the full content of database_update_existing_supabase.sql
```

After that, commit and redeploy the updated files to Vercel.


## V3.2 Important Notes

1. After uploading the files to GitHub, run `database_update_existing_supabase.sql` in Supabase SQL Editor.
2. The coordinator page now requires login before showing the table. Use a Supabase Auth user email/password.
3. If the Open Coordinator View button is blocked by the browser, the code falls back to opening the coordinator link in the current tab.
4. Cover/Free sessions are temporary. They are removed automatically after their selected hour finishes. Paid sessions remain weekly.
5. The admin Delete Student button deletes the student, sessions, and feedback rows.

## V3.3 Feedback Download + Coordinator Cards

- The **Available time in week** section is now shown as clean day cards with time chips, slot count, and a Today badge.
- The **Download Feedback** flow now opens a small popup before downloading.
- The popup lets you choose:
  - From Session
  - To Session
  - Download PDF
  - Download JSON
- Leaving the range empty downloads all saved feedback for that student.
- Example: From `1` to `8` downloads only feedback rows for sessions 1 through 8.
- PDF reports still use the Edubia Arabic branded layout in `report.js`.
- JSON downloads contain the selected range, student summary, sessions, and feedback rows.

Upload these files to GitHub and keep your existing `config.js` unchanged.


## V6 PDF layout fix
- Fixed PDF report page heights so cards are not clipped.
- Moved attendance section to page 3 when session ranges are long.
- Reduced spacing and card heights to keep every page complete in A4 export.
