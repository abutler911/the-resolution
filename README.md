# 🎵 The Resolution

A piano practice tracker — a tip of the hat to music's tension and resolve.

Log what you actually worked on (the piece, the passage, the tempo, how it
went), set goals worth chasing, and watch the hours turn into progress you can
see. The music-theory trainer that started this app is still here, one tab over.

## What it does

| Area | What you get |
| ---- | ------------ |
| **Practice log** | Sessions built from *segments* — one per thing you worked on, with focus area, piece, minutes, working tempo, bar range, hands, metronome and a 1–5 rating |
| **Bench console** | A stopwatch and a Web Audio metronome (with tap tempo) that feed straight into the segment you're logging |
| **Goals** | Minutes / sessions / days per day, week or month, or a target tempo on a piece — optionally narrowed to one focus area or one piece |
| **Repertoire** | A personal library from wishlist to performance-ready, each piece carrying its own time, best tempo and tempo-progression chart |
| **Insights** | Streaks, a practice calendar heatmap, minutes over time, where the hours actually go, and your most-practised pieces |
| **Theory** | The original trainer, ear training, lessons, reference diagrams and glossary |

## Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS       |
| Backend  | Node + Express + TypeScript                       |
| Database | PostgreSQL + Prisma ORM                           |
| Auth     | JWT (bcrypt-hashed passwords)                     |

The repo is an npm-workspaces monorepo: [`client/`](client) and
[`server/`](server).

## Getting started

### 1. Prerequisites

- Node 20+
- Docker (for the Postgres container) — or your own Postgres instance

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp server/.env.example server/.env
# edit server/.env if needed (the defaults match docker-compose)
```

### 4. Start the database

```bash
npm run db:up        # starts Postgres in Docker
```

### 5. Set up the schema and seed data

```bash
npm run db:migrate   # creates tables
npm run db:seed      # loads starter lessons
```

### 6. Run the app

```bash
npm run dev          # runs API (:4000) and client (:5173) together
```

Open http://localhost:5173.

## Useful scripts

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Run client + server together                 |
| `npm run dev:server` | Run the API only                             |
| `npm run dev:client` | Run the frontend only                        |
| `npm run build`      | Production build of both workspaces          |
| `npm run db:up`      | Start the Postgres container                 |
| `npm run db:migrate` | Apply Prisma migrations                      |
| `npm run db:seed`    | Seed starter lessons                         |
| `npm run db:studio`  | Open Prisma Studio (DB browser)              |

## API overview

| Method | Endpoint                  | Auth | Description                       |
| ------ | ------------------------- | ---- | --------------------------------- |
| POST   | `/api/auth/register`      | —    | Create an account                 |
| POST   | `/api/auth/login`         | —    | Sign in, returns a JWT            |
| GET    | `/api/auth/me`            | ✓    | Current user                      |
| GET    | `/api/exercises/question` | —    | Generate a practice question      |
| POST   | `/api/exercises/attempts` | ✓    | Record an answered question       |
| GET    | `/api/lessons`            | —    | List lessons                      |
| GET    | `/api/lessons/:slug`      | —    | Read one lesson                   |
| GET    | `/api/progress/summary`   | ✓    | Accuracy, streak, lessons done    |
| POST   | `/api/progress/lessons`   | ✓    | Mark a lesson complete            |

### Practice tracking

Everything under `/api/practice` requires auth and is scoped to the signed-in
user.

| Method | Endpoint                        | Description                              |
| ------ | ------------------------------- | ---------------------------------------- |
| GET    | `/api/practice/sessions`        | List sessions (`from`, `to`, `pieceId`, `limit`) |
| POST   | `/api/practice/sessions`        | Log a session with its segments          |
| GET    | `/api/practice/sessions/today`  | Today's sessions                         |
| PUT    | `/api/practice/sessions/:id`    | Replace a session and its segments       |
| DELETE | `/api/practice/sessions/:id`    | Delete a session                         |
| GET    | `/api/practice/pieces`          | Repertoire with per-piece totals         |
| GET    | `/api/practice/pieces/:id`      | One piece plus its tempo history         |
| POST   | `/api/practice/pieces`          | Add a piece                              |
| PATCH  | `/api/practice/pieces/:id`      | Update or archive a piece                |
| DELETE | `/api/practice/pieces/:id`      | Delete a piece                           |
| GET    | `/api/practice/goals`           | Goals with progress computed on read     |
| POST   | `/api/practice/goals`           | Set a goal                               |
| PATCH  | `/api/practice/goals/:id`       | Edit, archive or restore a goal          |
| DELETE | `/api/practice/goals/:id`       | Delete a goal                            |
| GET    | `/api/practice/insights`        | Streaks, daily series, breakdowns (`days`) |

Day-scoped endpoints take a `today=YYYY-MM-DD` query parameter so "today"
means today where the player is, not where the server is. Practice days are
stored as UTC midnight of that local date, which keeps day bucketing stable
across timezones.

## Deployment

Production runs the **API on Render**, the **frontend on Netlify**, and the
**database on Supabase**. Config lives in [`render.yaml`](render.yaml) and
[`netlify.toml`](netlify.toml); see **[DEPLOY.md](DEPLOY.md)** for the full
step-by-step (including pointing a custom subdomain at Netlify).

## Project structure

```
the-resolution/
├── server/                 # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma    # data model
│   │   └── seed.ts          # starter lessons
│   └── src/
│       ├── controllers/     # request handlers (sessions, pieces, goals, insights…)
│       ├── routes/          # route definitions
│       ├── middleware/      # auth, error handling
│       └── lib/             # prisma client, jwt, musicTheory,
│                            # practiceDates + practiceStats (day bucketing,
│                            # streaks, goal windows)
└── client/                 # React + Vite + Tailwind
    └── src/
        ├── pages/
        │   ├── practice/    # dashboard, log, history, repertoire, goals, insights
        │   └── …            # Home, Theory hub, Trainer, Lessons, auth
        ├── components/
        │   ├── charts/      # hand-rolled SVG: bars, heatmap, tempo line, breakdown
        │   └── …            # Layout, timer, segment editor, shared UI
        ├── hooks/           # usePracticeTimer
        ├── lib/             # practice labels/colours, metronome, audio, notes
        ├── context/         # AuthContext
        └── api/             # fetch wrapper + typed practice calls
```

### Chart colours

Focus areas get a fixed categorical hue each (`client/src/lib/practice.ts`),
assigned by identity rather than rank so a focus area keeps its colour in every
chart. The set was validated against the app's dark surface for colour-vision
separation, lightness band, chroma and contrast — if you change one, re-validate
the palette as a set. Magnitude encodings (the calendar heatmap) use a single
indigo ramp instead.

## Where to go next

- **Practice reminders**: nudge on a missed day, off the streak data already there.
- **Session templates**: start from "my usual warm-up + Bach + scales".
- **Recordings**: attach audio to a segment and compare run-throughs over time.
- **Spaced repetition**: surface repertoire that's going stale before it slips.
- **Notation**: render staves/chords with VexFlow.
