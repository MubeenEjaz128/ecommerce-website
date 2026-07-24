# E Commerce Website

Production-oriented MERN fashion e-commerce monorepo.

## Phase 1 Status

The backend foundation is in place with Express, MongoDB, JWT auth, email verification, password reset, role-based protection, and seed data.

## Server Setup

1. Copy `server/.env.example` to `server/.env` and fill in your values.
2. Start MongoDB locally or with Docker.
3. Install dependencies:

```bash
cd server
npm install
```

4. Seed the database:

```bash
npm run seed
```

5. Run the API:

```bash
npm run dev
```

## API

- `GET /health`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/verify-email/:token`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password/:token`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/auth/me`