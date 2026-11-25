# FromChat Admin Panel

Material 3 Expressive web console for operating a FromChat instance. Login is restricted to the primary administrator account (`user.id === 1`).

## Local development

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (default `http://127.0.0.1:8300`).
2. `npm install`
3. `npm run dev -- --host 127.0.0.1 --port 8310`

## Docker

```bash
docker compose up --build
```

Serves the static build on port **8310**. Set `VITE_API_BASE_URL` at build time via compose build args or `.env`.

## Features

- Dashboard with live metrics (`/admin/ws/metrics`)
- Account management (suspend until, moderation)
- File browser (proxied through main API)
- Compliance bundle export (client-side ZIP)
- Chat filter tools and security log tail

UI polish uses the bundled **unslop** skills under `skills/unslop/`.