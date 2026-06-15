# TTPR 2026 — Student Internship Contract

Interactive, signable internship contracts for the LaGuardia Tech Talent Pipeline
Residency program, plus an admin dashboard to collect, view, print, and export
every signed contract.

- **Group 1 contract:** `/group1` (Internship June 22 – August 12, 2026)
- **Group 2 contract:** `/group2` (Internship July 6 – August 26, 2026)
- **Admin dashboard:** `/admin`

Students fill in their name + student ID, set up their RF account, agree to all
required statements, draw a signature, and submit. Each submission is stored with
the typed name, drawn signature image, date, and a reference code.

---

## What students see

A progress meter unlocks the signature pad only after every statement is checked
and their details are filled in. The "no timesheet = no pay" clause is highlighted.
On submit they get a confirmation screen with a reference code.

## What you (admin) get at `/admin`

- A table of all signed contracts, filterable by Group 1 / Group 2
- View any single contract (statements + signature image) and print it
- **Print all** — one page per contract, ready for the printer
- **Export CSV** — names, student IDs, emails, dates, references
- Download any signature as a PNG
- Delete a submission

---

## Deploy to Render (no local setup needed)

You only need a browser. Two things get created: a **GitHub repo** and a **Render
web service + Postgres database**.

### 1. Put the code on GitHub
1. Go to <https://github.com/new>, create an empty repo (e.g. `ttpr-contract`).
2. On the new repo page, click **uploading an existing file**.
3. Drag in **all the files from this folder** (or unzip and drag the contents —
   do not include the `node_modules` folder). Commit.

### 2. Create the database on Render
1. In the Render dashboard: **New → Postgres**. Name it, pick the free plan, create it.
2. Open it and copy the **Internal Database URL**.

### 3. Create the web service on Render
1. **New → Web Service**, connect your GitHub repo.
2. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add **Environment Variables** (Environment tab):

   | Key             | Value                                                        |
   |-----------------|--------------------------------------------------------------|
   | `DATABASE_URL`  | the Internal Database URL you copied                         |
   | `ADMIN_PASSWORD`| a passcode you choose for the admin dashboard                |
   | `COOKIE_SECRET` | any long random string                                       |
   | `NODE_ENV`      | `production`                                                 |

   Generate a `COOKIE_SECRET` with:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. Create the service. When it's live you'll have:
   - `https://YOUR-APP.onrender.com/group1`
   - `https://YOUR-APP.onrender.com/group2`
   - `https://YOUR-APP.onrender.com/admin`

Share the two group links with the right students. Sign in at `/admin` with your
`ADMIN_PASSWORD` to collect everything.

---

## Editing the contract text

All wording lives in **`content.js`**:
- `GROUPS` — internship dates and timesheet submission dates per group
- `clauses()` — the seven agreement statements
- `RF_INSTRUCTIONS_URL` — the official OneRF login directions PDF, linked on the
  contract as "step-by-step instructions"
- `RF_TIMESHEET_URL` — the Time and Leave Manual PDF (submitting/managing
  timesheets in Workday, non-exempt employees, pages 7–17)
- `RF_CLAIM_URL`, `RF_PASSWORD_EMAIL`, `CONTACT` — links and contact info

After editing, commit the change to GitHub; Render redeploys automatically.

---

## Run locally (optional)

Requires Node 20+. With no `DATABASE_URL`, it uses a local SQLite file.

```bash
npm install
npm run dev        # uses Node's built-in SQLite (--experimental-sqlite)
```

Then open <http://localhost:3000>. Admin passcode defaults to `ttpr2026`
unless you set `ADMIN_PASSWORD`.

## Notes
- Production uses PostgreSQL via `DATABASE_URL`. No native build steps.
- Signatures are stored as PNG data in the database and re-rendered for print.
- Contracts contain student PII — keep `ADMIN_PASSWORD` private and use HTTPS
  (Render provides it automatically).
