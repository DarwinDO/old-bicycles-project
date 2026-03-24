# Vercel frontend deploy proxy and SPA rewrite basics - 2026-03-24

## Why this file exists

This frontend is a Vite + React Router SPA. In local development, Vite proxies `/api` and `/ws` to the backend. When the app is deployed to Vercel, that local proxy no longer exists unless we recreate the behavior with Vercel config.

Without extra deploy config, two things break quickly:

1. Deep links like `/assistant` or `/profile` can return `404` after a page refresh.
2. Relative requests like `/api/auth/login` stop reaching the backend because Vercel only serves the static frontend by default.

## What changed

We added [vercel.json](/e:/Old_bicycle_system/old-bicycles-project/fe/vercel.json) with three rewrite rules:

1. `/api/:path*` -> backend Render URL
2. `/ws/:path*` -> backend Render URL
3. all other routes -> `/index.html`

## Runtime flow after deploy

### Normal page route

1. User opens `https://<frontend>.vercel.app/assistant`
2. Vercel sees that the request is not `/api/*` or `/ws/*`
3. Vercel rewrites it to `/index.html`
4. React Router boots and renders the `AssistantPage`

### API request

1. FE code in [http.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/http.ts) sends a relative request like `/api/products`
2. Browser sends that request to the Vercel domain
3. Vercel rewrites `/api/products` to the Render backend
4. Backend responds
5. Browser still sees the request as same-origin with the FE domain

### Chat socket request

1. FE code in [chat.stomp.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/sockets/chat.stomp.ts) uses `/ws`
2. Browser requests `/ws` from the Vercel domain
3. Vercel rewrites the request to the Render backend WebSocket/SockJS endpoint

## Why proxy through Vercel for dev deploy

This keeps the deployed FE close to local development:

- local dev uses Vite proxy
- deployed preview uses Vercel rewrite proxy

That means we do not need to hardcode `VITE_API_BASE_URL` just to get a first deploy working.

## Important limitation

The backend still needs its own correct public settings later, especially:

- `APP_FRONTEND_URL` for frontend-facing links
- SePay webhook URL for public payment callbacks

So this FE deploy config solves frontend routing/proxying, but it does not replace backend environment setup.
