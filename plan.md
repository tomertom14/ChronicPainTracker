# ChronicPainTracker — Fresh "Warm Journal" Redesign + Usefulness Roadmap

## Context

The owner stepped away from this project for a while and asked to (1) modernize the UI and
(2) make the app more useful. On inspection:

- **The UI is already modern** — the last commit (`feat : upgrade UI`) gave it a polished
  sage/emerald/sand palette with Playfair serif and animations. So "modern UI" is done; the
  owner instead wants a **fresh visual redesign** in a new direction: **Warm Journal**
  (terracotta/amber, paper background, espresso ink, Fraunces serif — intimate/diary feel,
  not clinical).
- **The app is not really a "tracker."** It's a guided emotional-release practice: rate ~14
  emotions (0–10) → deep-dive the top 3 with 5 reflective questions → "cleansing shower"
  visualization → "letting go" release → save. Sessions are persisted
  (`PracticeSession` + `EmotionEntry`, timestamped) **but there is no way to read them back** —
  no GET endpoint, no history/insights/trends screen. The dashboard's "Keep the streak" card
  is decorative (no real data). For something called a tracker, nothing is trackable over time.

Goal: apply a genuine fresh **Warm Journal** redesign, then close the usefulness gap —
history/insights, real streaks/reminders, and (scope TBD together) actual pain tracking.

## Stack facts (for the implementer)

- **Frontend:** Angular (standalone components, signals), Tailwind **v4** (tokens via `@theme`
  in `Frontend/src/styles.css`), ngx-translate (`Frontend/src/assets/i18n/{en,he}.json`).
- **Backend:** ASP.NET Core Web API + EF Core (Postgres via `docker-compose.yml`), JWT auth.
  DbContext: `Backend/ChronicPainTracker.Api/Data/AppDbContext.cs`.
- Color tokens (`emerald-*`, `sage-*`, `sand-*`) are used **163 times across 8 files** — the
  redesign is systematic but mechanical.

---

## Phase 1 — Fresh "Warm Journal" redesign (do first; front-end only, zero backend risk)

### 1a. New design tokens & fonts — `Frontend/src/styles.css`
Replace the `@theme` block. Introduce a warm, semantically-named palette and swap fonts:
- `--color-clay-*` (terracotta ramp, primary — e.g. 500 `#C2643B`)
- `--color-amber-*` (accent/highlights — e.g. 500 `#E8A33D`)
- `--color-paper-*` (warm off-white → sand neutrals for backgrounds/borders — base `#FBF6EF`)
- `--color-ink-*` (espresso browns for text — darkest `#2B211A`)
- `--font-serif: "Fraunces", ...` (headings), `--font-sans: "General Sans"/"Inter", ...` (body).
- Update `@layer base` body/selection colors; keep `animate-fade-in`/`wave` keyframes.
- Load Fraunces (+ chosen sans) in `Frontend/src/index.html` (link/preconnect) or via CSS import.

### 1b. Restyle every template to the new tokens
Map old→new consistently (e.g. `emerald-900`→`clay-700`/`ink-900`, `sage-50`→`paper-50`,
`sand-*`→`amber-*`), tune shadows/radii toward a softer "paper card" feel:
- `Frontend/src/app/features/dashboard/dashboard.html`
- `Frontend/src/app/features/practice/practice.html` (+ `practice.css`)
- `Frontend/src/app/features/auth/login/login.html`, `.../register/register.html`,
  `.../verify-email/verify-email.html`
- `Frontend/src/app/core/layout/navbar/navbar.html` (also update the `CP`/"PainTracker" mark)
- `Frontend/src/app/core/startup-loader.ts` (inline colors)
- Update product copy where the current design hard-codes it ("Find your peace within", etc.).

### 1c. Reusable primitives (optional but recommended)
Extract shared `@utility`/component classes (`.btn-primary`, `.card-paper`, `.input-warm`) in
`styles.css` so the new look stays consistent and future screens (Phase 2+) inherit it.

**Verify Phase 1:** `cd Frontend && npm install && npm start` → http://localhost:4200; walk
login → dashboard → full practice flow; confirm no leftover green, fonts load, mobile layout ok.

---

## Phase 2 — History & Insights (biggest usefulness win; unblocks the "tracker" promise)

### Backend — `Backend/ChronicPainTracker.Api/Controllers/PracticeController.cs`
- Add `GET /api/practice` → current user's sessions (from JWT `NameIdentifier`), newest first,
  including `Emotions`, projected to a response DTO (new `DTOs/PracticeSessionResponseDto.cs`).
- Add `GET /api/practice/{id}` for a single session detail.
- (Optional) `GET /api/practice/insights` returning pre-aggregated stats (avg intensity per
  emotion, sessions-per-week, top emotions) to keep the client light.

### Frontend — new `features/history/` (+ route + navbar link)
- New standalone `HistoryComponent` (list of past sessions: date, top emotions, intensity chips)
  and a detail view (the 5 deep-dive answers).
- An **Insights** panel with simple charts (intensity trend over time, most-frequent emotions).
  Recommend a lightweight approach (inline SVG/CSS bars, or `ng2-charts`/Chart.js if a dep is ok
  — **decision to make together**).
- Add `history` route in `Frontend/src/app/app.routes.ts` (guarded by `authGuard`) and a nav
  link in `navbar.html`. Replace the dashboard's fake "streak" card with a real
  "recent sessions" / "last practiced" summary fed by the new endpoint.
- Add i18n keys to `en.json` + `he.json`.

**Verify Phase 2:** `docker compose up -d` + `dotnet run` (from `Backend/ChronicPainTracker.Api`);
complete a practice session, then open History and confirm it appears with correct data + charts.

---

## Phase 3 — Real streaks & reminders

- Backend: streak/summary endpoint (consecutive-day count, total sessions, last practiced) —
  derivable from `PracticeSession.CreatedAt`; expose via `GET /api/practice/insights` or a
  dedicated `/api/practice/streak`.
- Frontend: make the dashboard streak card real; small "you're on an N-day streak" nudge.
- Reminders: start with a **local** browser reminder (opt-in `Notification` API + time-of-day
  pref in `localStorage`). Server-side/email/push reminders are a later, larger add — **decide
  together** whether that's in scope.

---

## Phase 4 — Actual pain tracking (scope to decide together)

Live up to the "Pain Tracker" name by adding a physical-pain log alongside emotional practice:
- New models `Backend/.../Models/PainEntry.cs` (+ DbSet, EF migration): timestamp, intensity,
  body location(s), pain type, medication taken, sleep/notes.
- New `PainController` (POST/GET), new frontend `features/pain/` with a quick-log form and an
  optional **body-map** picker; fold pain data into the Insights charts (pain vs. emotion trends).
- **Decisions to make together:** how deep the body-map goes, whether meds/sleep are tracked,
  and whether pain and emotional practice share one "check-in" flow or stay separate.

---

## Recommended order & collaboration points

1. **Phase 1 (redesign)** — self-contained, no backend, immediate visible payoff. Start here.
2. **Phase 2 (history & insights)** — highest usefulness ROI; makes the app a real tracker.
3. **Phase 3 (streaks/reminders)** — cheap once Phase 2 data path exists.
4. **Phase 4 (pain tracking)** — largest; refine scope together before building.

Open decisions to settle as we go (owner wants to "think together"): charting library vs.
hand-rolled SVG (Phase 2); reminder mechanism — local vs. server/email/push (Phase 3);
pain-tracking depth and whether it merges with the practice flow (Phase 4). An optional warm
**dark mode** can be layered on after Phase 1 if desired.
