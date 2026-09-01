# TutorFlow — Project Brief

## 1. What this is
A session platform for 1:1 online tutors. Two roles: **Tutor** (manages students, schedules sessions, writes notes, triggers AI) and **Student** (read-only view of their own sessions, notes, homework).

7-day internship task. Scored out of 100 — heaviest weights: AI features (25), Session states (15) + Database/backend (20).

## 2. Stack
| Layer | Choice | Why |
|---|---|---|
| Backend | NestJS + Prisma + PostgreSQL (Neon) | Relational integrity for the session lifecycle; Prisma migrations are fast to iterate on solo |
| Frontend | Next.js 14 (App Router) | Fast to build two role-scoped UIs; easy Vercel deploy |
| Auth | JWT (access + refresh), httpOnly cookies | No public signup — tutors create student accounts, so a simple credentials flow is enough |
| AI | Gemini `gemini-2.0-flash` (AI Studio) | Free tier, fast, good at structured JSON output |
| Hosting | Render (API) + Vercel (frontend) + Neon (DB) | All free-tier, no cold-start config needed beyond a keep-alive if Render sleeps |

Nx monorepo is optional here — this app is small enough that two plain repos (or a simple `/apps` folder without Nx) will be faster to ship in 7 days than monorepo tooling overhead.

## 3. Database schema (PostgreSQL / Prisma)

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role     // TUTOR | STUDENT
  name         String
  createdAt    DateTime @default(now())

  // Tutor side
  studentsManaged Student[]      @relation("TutorStudents")
  sessionsAsTutor Session[]      @relation("TutorSessions")

  // Student side
  studentProfile  Student?       @relation("StudentUser")
}

enum Role {
  TUTOR
  STUDENT
}

model Student {
  id             String   @id @default(uuid())
  userId         String   @unique          // login identity for the student
  user           User     @relation("StudentUser", fields: [userId], references: [id])
  tutorId        String
  tutor          User     @relation("TutorStudents", fields: [tutorId], references: [id])

  name           String
  subject        String
  currentLevel   String
  learningGoals  String   @db.Text
  weakAreas      String   @db.Text          // free text, read by AI

  sessions       Session[]
  createdAt      DateTime @default(now())
}

model Session {
  id            String        @id @default(uuid())
  tutorId       String
  tutor         User          @relation("TutorSessions", fields: [tutorId], references: [id])
  studentId     String
  student       Student       @relation(fields: [studentId], references: [id])

  scheduledAt   DateTime
  topic         String
  status        SessionStatus @default(SCHEDULED)

  notes         String?       @db.Text     // autosaved during IN_PROGRESS

  aiPlan        Json?         // { objectives[], outline[4], practiceQuestions[3] }
  aiReview      Json?         // { summary, homework[2-3], nextSuggestion }

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([tutorId, scheduledAt])   // for clash-check query
}

enum SessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  AI_REVIEWED
}
```

**Relationships:** One `User` (role=TUTOR) manages many `Student`s and many `Session`s. Each `Student` has exactly one login `User` (role=STUDENT) via `userId`. Each `Session` belongs to one tutor and one student. This keeps "a student sees only their own data" and "a tutor sees only their own students" enforceable with a single `WHERE tutorId = req.user.id` (or `WHERE studentId = req.user.studentProfile.id`) on every query — no cross-tenant leakage.

**Lifecycle enforcement:** `SessionStatus` is an enum with one legal forward path. The service layer (not the UI) checks `currentStatus → nextStatus` against an allowed-transition map before any update:
```
SCHEDULED → IN_PROGRESS → COMPLETED → AI_REVIEWED
```
Any other transition throws a 400. Once `COMPLETED`, the only allowed mutation is the `AI_REVIEWED` transition (triggering the AI review) — notes and other fields become read-only at the service layer.

**Clash detection:** before creating a session, query `Session.findFirst({ tutorId, scheduledAt })` (or a time-range overlap check if sessions have variable duration) and reject if found.

## 4. API surface (rough)
```
POST   /auth/login
GET    /me

# Tutor-only (role guard)
POST   /students                       create student (+ auto-creates student User)
GET    /students                       list own students
GET    /students/:id                   student profile + sessions
POST   /sessions                       create (clash-checked)
PATCH  /sessions/:id/notes             debounced autosave (only while IN_PROGRESS)
PATCH  /sessions/:id/status            transition (validated against allowed map)
POST   /sessions/:id/ai-plan           generate + store aiPlan (status must be SCHEDULED or later, before IN_PROGRESS ideally)
POST   /sessions/:id/ai-review         generate + store aiReview (status must be COMPLETED)
POST   /students/:id/progress-summary  aggregate all aiReviews → AI paragraph

# Student-only (role guard)
GET    /my/sessions                    upcoming
GET    /my/sessions/history            completed, read-only notes + homework
```
Every tutor route re-derives `tutorId` from the JWT, never from the request body/params — this is what "server-side role checks" actually means for the rubric.

## 5. AI prompts (this is 25/100 — designed, not generic)

### 5.1 Session plan (`POST /sessions/:id/ai-plan`)
Sent context: student profile (subject, level, goals, weak areas) + last 3 past sessions' `aiReview.summary` and `aiReview.nextSuggestion` (so the plan continues where the last one left off, not a cold start).

```
You are an experienced 1:1 tutor assistant. Create a session plan for this specific student — do not write a generic lesson plan.

Student:
- Subject: {subject}
- Current level: {currentLevel}
- Learning goals: {learningGoals}
- Known weak areas: {weakAreas}

Recent session history (most recent first, may be empty for a new student):
{for each of last 3 sessions: "- {date}: {aiReview.summary} | Suggested next: {aiReview.nextSuggestion}"}

Today's session topic: {topic}

Using the weak areas and the "suggested next" from the most recent session (if any), write a plan that
directly targets what this student struggles with — do not just cover the topic in the abstract.

Return ONLY valid JSON, no markdown fences, in this exact shape:
{
  "objectives": ["...", "..."],           // 2-4 concrete learning objectives
  "outline": ["...", "...", "...", "..."], // exactly 4 points, ordered
  "practiceQuestions": ["...", "...", "..."] // exactly 3, difficulty matched to currentLevel
}
```

### 5.2 Session review (`POST /sessions/:id/ai-review`)
Sent context: student profile + the session's raw notes.

```
You are reviewing a completed 1:1 tutoring session. Read the tutor's raw notes below and turn them into a
structured review. Be specific — reference what actually happened in the notes, not generic tutoring advice.

Student: {name}, {subject}, level {currentLevel}. Known weak areas: {weakAreas}.
Session topic: {topic}
Tutor's raw notes:
"""
{notes}
"""

Return ONLY valid JSON, no markdown fences:
{
  "summary": "...",              // 2-3 sentences, what was actually covered/how it went
  "homework": ["...", "..."],    // 2-3 tasks, directly tied to what the notes say the student struggled with
  "nextSuggestion": "..."        // one concrete thing to cover in the next session
}
```

### 5.3 Progress summary (`POST /students/:id/progress-summary`)
Sent context: every past `aiReview` for that student, in order.

```
You are summarizing a student's progress across multiple tutoring sessions. Below is every session review
so far, oldest first. Identify a trend, not just a list of what happened.

{for each session: "Session {n} ({date}) — Summary: {summary} | Homework given: {homework} | Suggested next: {nextSuggestion}"}

Write one short paragraph (4-6 sentences) covering:
- What this student has genuinely improved at across sessions
- What weak area is still recurring across multiple sessions (if any)
- One honest, specific recommendation for the tutor going forward

Return plain text, no JSON, no headers.
```

### 5.4 Failure handling (scored: "app does not break when the AI call fails")
- Wrap every Gemini call in try/catch with a timeout (~15s).
- On failure: return a 502 with `{ error: "AI generation failed, you can retry" }`, do **not** write partial/garbage JSON to `aiPlan`/`aiReview`.
- Frontend: show a retry button in place of the plan/review panel, not a crash.
- Validate the model's JSON response (parse + shape-check) before saving — if it doesn't match the expected shape, treat it as a failure and let the tutor retry rather than storing malformed data.

## 6. What's explicitly out of scope for v1
- Public signup (tutors create students — per spec)
- Email on scheduling (bonus, only if time remains after the 8 core features)
- Session duration/end time (spec only mentions date+time; treat clash check as same start-time collision unless you want to add a duration field)