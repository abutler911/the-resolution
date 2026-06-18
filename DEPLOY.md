# Deploying The Resolution

Production setup: **API on Render**, **frontend on Netlify**, **database on
Supabase** (already running), served from a subdomain of `andrewfbutler.com`
(this guide uses `resolution.andrewfbutler.com` — substitute your choice).

```
 Browser ──▶ resolution.andrewfbutler.com  (Netlify: React app)
                     │  fetch VITE_API_URL/api/*  (CORS)
                     ▼
            the-resolution-api.onrender.com  (Render: Express)
                     │
                     ▼
                Supabase (Postgres)
```

Everything in `render.yaml`, `netlify.toml`, and the env files is already in
the repo. You only need to create the two services and set a few variables.

---

## 1. Backend → Render

1. Push/merge this branch to `main` first.
2. Go to **render.com → New → Blueprint** and connect the `abutler911/the-resolution`
   repo. Render reads `render.yaml` and proposes the `the-resolution-api` service.
3. Before the first deploy, set the two secret env vars (the blueprint marks
   them `sync: false`):
   - **`DATABASE_URL`** — your Supabase **Session pooler** connection string
     (port 5432), the same one in `server/.env`.
   - **`CLIENT_ORIGIN`** — your frontend origin(s), comma-separated. You won't
     have the final domain yet, so start with a placeholder and update it in
     step 3 once Netlify is live, e.g.
     `https://resolution.andrewfbutler.com,https://the-resolution.netlify.app`
   - `JWT_SECRET` is auto-generated; `JWT_EXPIRES_IN` and `NODE_ENV` are preset.
4. Deploy. The build runs `prisma migrate deploy`, so your schema stays in sync.
5. When it's live, note the URL — e.g. **`https://the-resolution-api.onrender.com`**.
   Visit `/api/health` to confirm you get `{"status":"ok"}`.

> **Free tier note:** the service sleeps after ~15 min idle, so the first
> request after a nap takes ~30–50s to wake. Fine for personal use; upgrade the
> instance or add an uptime pinger if you want it always warm.

---

## 2. Frontend → Netlify

1. Go to **netlify.com → Add new site → Import an existing project** and pick the
   repo. Netlify reads `netlify.toml` (build command, publish dir, SPA redirect)
   automatically.
2. Under **Site settings → Environment variables**, add:
   - **`VITE_API_URL`** = your Render URL from step 1
     (e.g. `https://the-resolution-api.onrender.com`, no trailing slash).
3. Deploy. You'll get a `https://<random-name>.netlify.app` URL — test it works
   end to end (register, answer a question, check Progress).

> If you change `VITE_API_URL` later, trigger a **redeploy** — it's baked in at
> build time.

---

## 3. Point the subdomain at Netlify

1. In Netlify: **Domain management → Add a domain** →
   `resolution.andrewfbutler.com`. Netlify will show the DNS target.
2. In your DNS provider for **andrewfbutler.com**, add a record:

   | Type  | Name         | Value                          |
   | ----- | ------------ | ------------------------------ |
   | CNAME | `resolution` | `<your-site>.netlify.app`      |

   (Netlify may instead give you a specific load-balancer host or suggest its
   own DNS — follow whatever its dashboard shows for the cleanest setup.)
3. Wait for DNS to propagate; Netlify auto-provisions a Let's Encrypt SSL cert.
4. **Back on Render**, make sure `CLIENT_ORIGIN` includes the final domain
   (`https://resolution.andrewfbutler.com`) and redeploy if you changed it —
   otherwise the browser will block API calls with a CORS error.

Done — open `https://resolution.andrewfbutler.com`. 🎵

---

## Optional: a subdomain for the API too

If you'd rather the API live at `api.resolution.andrewfbutler.com` than the
`onrender.com` URL:

1. In Render → the service → **Settings → Custom Domains**, add
   `api.resolution.andrewfbutler.com` and add the CNAME it gives you to your DNS.
2. Update Netlify's `VITE_API_URL` to `https://api.resolution.andrewfbutler.com`
   and redeploy the frontend.

## Troubleshooting

- **CORS error in the browser console** → `CLIENT_ORIGIN` on Render doesn't
  exactly match the frontend origin (scheme + host, no trailing slash). Fix and
  redeploy the API.
- **API calls 404 / hit Netlify instead of Render** → `VITE_API_URL` wasn't set
  at build time; set it and redeploy the frontend.
- **First request very slow** → Render free tier cold start (see note above).
- **DB connection errors** → confirm `DATABASE_URL` uses the Supabase Session
  pooler (port 5432) and the project isn't paused.
