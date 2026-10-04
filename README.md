# BudgetBuddy

> Keep track of all your recurring costs and plan future payments.

University project for **Web Application Architecture** at Hochschule der Medien Stuttgart (Prof. Dr. Fridtjof Toenniessen, 2025).

**Team:** Julia Bai · Sonja Schlegel · Timo Waldherr

## Idea

Most finance apps don't give a clear overview of running contracts. BudgetBuddy makes upcoming payments predictable, helps avoid financial bottlenecks and shows all obligations in one place.

## Features

- Registration, login and token-based authentication
- Create, edit and delete contracts
- Upload contract documents
- Generate a cancellation letter draft
- Dashboard with expense charts per category
- Balance calculation (monthly, quarterly, half-yearly, yearly)

<!-- TODO: add screenshots (dashboard, login, charts) -->

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Axios, Zod |
| Backend | NestJS (Node.js), Prisma ORM, Passport + JWT, Zod |
| Database | PostgreSQL |
| Auth | NextAuth.js (Credentials Provider), bcrypt, JWT |
| Infrastructure | Docker (3 containers: frontend, backend, database) |

## Architecture

**Layered architecture** (presentation, application, data management) with cross-cutting shared types and Zod schemas. The presentation layer never accesses the data layer directly.

**MVP pattern in the frontend:**

| Role | Responsibility | Example |
|---|---|---|
| Model | Data, API endpoints, validation schemas | NestJS controllers/services, `packages/shared-types` |
| View | Renders only what it receives, reports user events via callbacks | `ContractForm`, `ContractList` |
| Presenter | State, API calls, data preparation, optimistic updates with rollback | `useContracts`, `useContractForm` (custom hooks) |

Benefits: separation of concerns, presenter logic testable without UI rendering, reusable hooks, end-to-end type safety through shared Zod schemas.

### Repository structure

```
apps/
  backend/        NestJS API (controllers, services, auth, Prisma)
  web/            Next.js frontend (views, presenter hooks)
packages/
  shared-types/   Zod schemas, DTOs and types shared by frontend and backend
```

### API overview

All routes except register and login are protected by a JWT guard.

| Resource | Endpoints |
|---|---|
| `/user` | `POST /` (register), `POST /login`, `GET/PUT/DELETE /{id}` |
| `/contracts` | `GET /me`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| `/contracts` (documents) | `POST /{id}/documents`, `DELETE /documents/{documentId}`, `GET /documents/{documentId}/download` |

## Authentication

1. **Register:** user data is validated and stored, passwords are hashed with bcrypt.
2. **Login:** the backend validates the credentials and signs a JWT.
3. **Authorized requests:** the client sends the token in the `Authorization` header, a Passport JWT strategy verifies signature and expiry, `JwtAuthGuard` protects the controllers.
4. **Logout:** the client-side session is cleared.

## Getting Started

**Prerequisites:** Docker and Docker Compose

```bash
git clone https://github.com/juliabb1/BudgetBuddy.git
cd BudgetBuddy
cp .env.example .env     # adjust values (JWT_SECRET, database credentials)
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| PostgreSQL | port 5432 |


## License

Created as a university project at HdM Stuttgart.
