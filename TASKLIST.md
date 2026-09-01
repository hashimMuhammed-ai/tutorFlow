# TutorFlow — Task List (7 days)

Feed this + PROJECT_BRIEF.md to Antigravity as the working spec. Check off as you go.

## Day 1 — Skeleton + deploy pipeline
- [x] Init backend repo (NestJS), init frontend repo (Next.js)
- [x] Push both to GitHub
- [ ] Deploy empty "Hello TutorFlow" pages to Render + Vercel — confirm the pipeline works before building anything real
- [ ] Provision Neon Postgres, add connection string to Render env vars
- [ ] Get Gemini API key, add to Render env vars

## Day 2 — Auth + roles
- [ ] Prisma schema: `User`, `Student`, `Session` models (from PROJECT_BRIEF.md §3), run first migration
- [ ] `POST /auth/login` (bcrypt password check, issue JWT)
- [ ] `GET /me`
- [ ] NestJS `RolesGuard` reading role off the JWT — apply to all tutor/student route groups
- [ ] Frontend: login page, JWT stored httpOnly cookie, role-based redirect (tutor dashboard vs student dashboard)
- [ ] Seed script: 1 tutor, 1 student, a couple of sessions — this becomes your README test data

## Day 3 — Students + scheduling (plain data, no AI yet)
- [ ] `POST /students`, `GET /students`, `GET /students/:id` (tutor-scoped)
- [ ] Student profile form (name, subject, level, goals, weak areas)
- [ ] `POST /sessions` with clash check (query existing sessions for that tutor at that time)
- [ ] Session status enum + transition-validation service method (reject illegal jumps)
- [ ] Scheduling form with basic validation (required fields, no past dates)

## Day 4 — Notes autosave + status transitions
- [ ] `PATCH /sessions/:id/notes` — only allowed while status = IN_PROGRESS
- [ ] Frontend: notes textarea with debounce (~1.5s after last keystroke) calling the PATCH endpoint
- [ ] Manual "start session" / "complete session" buttons that call `PATCH /sessions/:id/status`
- [ ] Verify: reload the page mid-session, confirm notes persisted (this is explicitly scored)

## Day 5 — AI integration
- [ ] Gemini client wrapper (single service, used by all 3 AI endpoints)
- [ ] `POST /sessions/:id/ai-plan` using the exact prompt in PROJECT_BRIEF.md §5.1
- [ ] `POST /sessions/:id/ai-review` using §5.2 (only callable when status = COMPLETED; on success, transition to AI_REVIEWED)
- [ ] `POST /students/:id/progress-summary` using §5.3
- [ ] Failure handling per §5.4: try/catch, timeout, JSON shape validation, no partial writes
- [ ] Frontend buttons to trigger each, with loading state

## Day 6 — Student view + progress view + error/loading states
- [ ] Student dashboard: upcoming sessions, past session notes (read-only), homework list
- [ ] Tutor progress view: student's sessions in order + "progress summary" button
- [ ] Loading spinners on every async action
- [ ] Error toasts/messages for: AI failure, clash conflict, invalid transition, expired session
- [ ] Confirm role isolation manually: log in as tutor B, verify you cannot see tutor A's students/sessions via direct API calls (not just hidden UI)

## Day 7 — Polish, README, submission
- [ ] Write README: DB schema + relationships, all 3 prompts pasted in with the reasoning from §5, test logins (1 tutor, 1 student)
- [ ] "What works / what doesn't / what's next" section at the top if anything is incomplete
- [ ] Five sentences at the end: what you'd build with one more day
- [ ] Final deploy check: open the live URL in an incognito window, log in as both roles, verify the one thing that must work — tutor logs in and reaches a working screen
- [ ] Double-check all env vars are on the deployment, not just local `.env`
- [ ] Submit: live URL + GitHub link

## Cut list if you run out of time (in order of what to drop first)
1. Bonus email notification — not required, skip entirely if tight
2. Progress summary (§5.3) — nice-to-have on top of the two required AI features
3. Polish on error states — a plain error message beats a crash, doesn't need to be pretty
Never cut: role-based server-side access control, session state validation, at least one AI feature working end to end.