# Shagriha rental frontend

Next.js frontend for the Shagriha Spring Boot REST API.

## Requirements

- Node.js 22 or newer and npm
- A running `shagriha_backend_services` API
- Nginx (or another reverse proxy) for the public hostname and TLS
- A Mapbox public access token if map search is required

## Environment configuration

Copy `.env.example` to `.env.local` for local development. For a server build,
create `.env.production.local` on the server and do not include it in Git or a
source ZIP.

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://api-sandbox.example.com/api/v1/
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=replace_with_public_mapbox_token
```

`NEXT_PUBLIC_*` values are embedded into the browser bundle at **build time**.
Set the final API hostname and Mapbox token before running `npm run build`; if
they change, rebuild and restart the frontend. Keep the trailing slash on
`NEXT_PUBLIC_API_BASE_URL`. Demo mode must remain `false` on the deployed site.

The backend `FRONTEND_URL` must exactly match the browser origin, for example
`https://sandbox.example.com`, because it controls CORS.

## Local run

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The frontend runs at `http://localhost:3000`; the example API is
`http://localhost:8080/api/v1/`.

## Contabo deployment

1. Install Node.js 22 and Nginx.
2. Copy the clean frontend source to a stable directory such as
   `/opt/shagriha/frontend`.
3. Create `.env.production.local` with the real sandbox API URL.
4. Install locked dependencies, validate, and build:

   ```bash
   npm ci
   npm run lint
   npm run build
   ```

5. Run the production server under systemd (or another process supervisor):

   ```bash
   npm start -- --hostname 127.0.0.1 --port 3000
   ```

   Configure automatic restart and run the service as a non-root user.
6. Configure Nginx to proxy the frontend hostname (for example
   `sandbox.example.com`) to `http://127.0.0.1:3000`. Preserve `Host`,
   `X-Real-IP`, `X-Forwarded-For`, and `X-Forwarded-Proto` headers.
7. After the DNS CNAME/A record points to the Contabo server, issue a TLS
   certificate, reload Nginx, and verify the site in a browser.

The frontend and backend may use separate hostnames. DNS records only map a
hostname; Nginx performs the routing to ports 3000 and 8080. Keep those ports
bound to localhost or blocked by the firewall, and expose only ports 80/443.

## Authentication notes

JWT authentication uses `POST /auth/signup` and `POST /auth/login`, and
authenticated screens validate the token with `GET /auth/me`. The access token
is stored in browser local storage. Signing out removes it. The backend
currently creates a new signing key on every restart, so users must sign in
again after an API restart.

## Handoff ZIP

Send source files, lock files, and README files. Exclude generated files,
dependencies, local secrets, and Git history:

- Exclude: `node_modules`, `.next`, `.git`, `.env*` (except `.env.example`),
  coverage output, `.DS_Store`, and logs.
- Include: `package.json`, `package-lock.json`, `.env.example`, `src`, `public`,
  configuration files, and this README.

From the directory containing both repositories, one suitable command is:

```bash
zip -r shagriha-deployment-source.zip \
  Orbitekk_rental_front_end shagriha_backend_services \
  -x '*/node_modules/*' '*/.next/*' '*/target/*' '*/.git/*' \
     '*/.env' '*/.env.local' '*/.env.production*' '*/.DS_Store'
```

The developer should build on the server (or in CI) rather than receiving local
`node_modules`, `.next`, or Maven `target` output.

## Git branch guidance

Maintain the deployment state in Git rather than treating the ZIP as the source
of truth. A permanent environment branch is usually unnecessary and tends to
drift. Tag the exact tested commit (for example `sandbox-2026-08-14`) or create
a short-lived release branch only when stabilization fixes must be isolated.
Keep server secrets and environment-specific files outside every branch.
