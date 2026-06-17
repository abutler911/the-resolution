# 🎵 The Resolution

A music theory study app — a tip of the hat to music's tension and resolve.

Drill intervals, chords, and scales; read focused lessons; and track your
progress over time.

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

## Project structure

```
the-resolution/
├── server/                 # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma    # data model
│   │   └── seed.ts          # starter lessons
│   └── src/
│       ├── controllers/     # request handlers
│       ├── routes/          # route definitions
│       ├── middleware/      # auth, error handling
│       └── lib/             # prisma client, jwt, musicTheory
└── client/                 # React + Vite + Tailwind
    └── src/
        ├── pages/           # Home, Trainer, Lessons, Progress, auth
        ├── components/      # Layout, ProtectedRoute
        ├── context/         # AuthContext
        └── api/             # fetch wrapper
```

## Where to go next

- **Ear training**: add Web Audio / Tone.js playback so questions can be heard.
- **Markdown lessons**: render lesson bodies with `react-markdown`.
- **Spaced repetition**: weight trainer questions toward weak topics.
- **Notation**: render staves/chords with VexFlow.
