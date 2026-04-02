# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Use Node.js 22 (recommended) or 20 for local development.

```bash
nvm use
```

If you do not have `.nvmrc` support, install and run with Node 22 manually before installing dependencies.

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Docker Compose Deployment (One Command)

This repository now includes a production-ready Docker Compose setup with:

- Nuxt app container
- Caddy reverse proxy with automatic Let's Encrypt SSL
- Env bootstrap for missing variables

### Prerequisites

- Docker + Docker Compose plugin installed
- Public domain pointing to your server (A/AAAA record)
- Ports `80` and `443` open

### Deploy

Run exactly one command:

```bash
./scripts/deploy.sh --domain your.domain.com --email you@example.com
```

What this command does:

1. Creates `.env.deploy` (from `.env` or `.env.example`) if missing
2. Injects domain + ACME email
3. Generates `NUXT_SESSION_PASSWORD` if missing
4. Starts `docker compose up -d --build`

### Important env vars

The deployment file is `.env.deploy`.

Make sure these are set with real values for production:

- `NUXT_SUPABASE_URL`
- `NUXT_SUPABASE_KEY`
- `NUXT_SUPABASE_SERVICE_KEY`
- `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NUXT_STRIPE_SECRET_KEY`
- `NUXT_STRIPE_ALLOWED_PRICE_IDS`
- `NUXT_STRIPE_DEFAULT_PRICE_ID`

You can inspect status with:

```bash
docker compose ps
docker compose logs -f caddy
docker compose logs -f app
```
