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
  - Read-only
  - Shows schedule and feedback only
  - Does NOT show prices
  - Does NOT show paid/free/cover type
  - Auto-refreshes every 10 seconds

- Data is stored in Supabase, not in local browser storage.
  This means when you update from the admin page, the coordinator page updates too.

---

## Files

- `index.html` — Admin dashboard
- `coordinator.html` — Public coordinator read-only view
- `styles.css` — White/simple styling
- `app.js` — Admin logic
- `coordinator.js` — Coordinator logic
- `config.js` — Supabase project URL and anon key
- `database.sql` — Database setup for Supabase

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
- The PDF is generated in the browser from the saved student feedback and schedule data, using `report.js`, `html2canvas`, and `jsPDF`.
- The downloaded file is automatically named with the student name, for example: `تقرير الطالب Ahmed — Edubia.pdf`.
