# Namma Basket MVP

Namma Basket is a simplified grocery delivery MVP for a small local area in Karnataka. It includes:

- A shopper app with OTP login, product browsing, cart, checkout, and order history
- An admin dashboard for product CRUD, order viewing, rider assignment, and status updates
- Razorpay test-mode checkout support with a COD fallback
- An `Express + MongoDB` backend and a `React + Vite + Tailwind` frontend

Architecture details live in [docs/architecture.md](/Users/sumanths/Desktop/DeliveryApp/docs/architecture.md).

## Folder structure

```text
DeliveryApp/
├── apps/
│   ├── api/
│   └── web/
├── docs/
├── package.json
└── README.md
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Optional environment files

Backend:

```bash
cp apps/api/.env.example apps/api/.env
```

Frontend:

```bash
cp apps/web/.env.example apps/web/.env
```

Notes:

- If `MONGODB_URI` is not set, the backend automatically uses an in-memory MongoDB instance for local MVP testing.
- Add Razorpay test keys to `apps/api/.env` and optionally `apps/web/.env` to use the real Razorpay test checkout. Without keys, online payment is simulated.

### 3. Run the backend

```bash
npm run dev:api
```

### 4. Run the frontend

```bash
npm run dev:web
```

### 5. Or run both together

```bash
npm run dev
```

## Seed data

Refresh demo products and the admin user:

```bash
npm run seed
```

The seeded admin phone number is `9876500000` and the mock OTP is `123456`.

## Build

```bash
npm run build
```

## Vercel deployment

Use Vercel only for the frontend app in this repo.

- This repo now includes [vercel.json](/Users/sumanths/Desktop/DeliveryApp/vercel.json) so a root deployment builds `apps/web` and serves the Vite output correctly.
- If your Vercel project Root Directory is set to `apps/web`, Vercel will use [apps/web/vercel.json](/Users/sumanths/Desktop/DeliveryApp/apps/web/vercel.json) instead. In that setup, the build command is just `npm run build`.
- Set `VITE_API_URL` in Vercel to your deployed backend URL, for example `https://your-api.onrender.com/api`.
- Because the backend is an Express server with MongoDB, deploy `apps/api` separately on Render, Railway, Fly.io, or AWS. Do not expect the current API to run as a Vercel static site.
- The rewrite rule in `vercel.json` is required so routes like `/cart`, `/orders`, and `/admin` load correctly after refresh.
