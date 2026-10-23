# DevAPI

API documentation and change tracking, built with GraphQL.

Teams keep endpoint docs, versions, and a changelog in one app. When v2 ships, the changelog shows what was added, what was removed, and which changes can break clients.

Built day to day by Code With Azlo.

## What problem this solves

API docs often live in a wiki or a stale Swagger file. After a new version, three questions are hard to answer:

- Which endpoints were added or removed?
- Did a field become required?
- Is this change breaking for existing clients?

DevAPI stores that information as data: a workspace owns APIs, each API owns versions, each version owns endpoints, parameters, schemas, examples, and a changelog.

## What happens when you use it

The React app never calls `/workspaces` or `/apis`. Every screen sends one HTTP request:

```http
POST http://localhost:4000/graphql
Authorization: Bearer <access token>
```

The body is a GraphQL query that lists only the fields that screen needs. Apollo Server checks those fields against `backend/src/graphql/typeDefs.js`, runs the matching resolver, and returns JSON in the same shape. The page reads that JSON through Apollo's `useQuery`.

A write (login, create workspace, delete an API) is the same URL. The body says `mutation` instead of `query`.

```
Browser
  → React page calls useQuery or useMutation
  → Apollo Client POSTs to /graphql
  → Express + Apollo Server
  → Resolver (auth check, then a service call)
  → Service (business rules)
  → Prisma
  → PostgreSQL
```

`GET /health` is the only REST route. It is a process ping. The dashboard does not use it.

## What you can do in the UI

| Page | What it does |
|---|---|
| Log in / Sign up | `login` and `register` mutations. Passwords are hashed with bcrypt. The response is a short-lived access JWT and a refresh JWT. |
| Dashboard | Database counts and your workspaces. Create or delete a workspace. |
| Workspaces | Search with a GraphQL variable. Open one workspace. |
| Workspace | Members, APIs, and a form that creates an API plus starter CRUD docs from a resource name such as `products`. |
| API docs | Endpoints, parameters, request/response JSON, and examples. Filter by method. Add an endpoint or delete the API. |
| Changelog | Compare two versions and list breaking, potentially breaking, and non-breaking changes. |
| GraphQL Explorer | Type any query against the same `/graphql` endpoint. The login token is attached for you. |
| Beginner guide | The same flow, written inside the app. |

Roles are `OWNER`, `ADMIN`, `MEMBER`, and `VIEWER`. Creating and deleting APIs require `OWNER` or `ADMIN`. Deleting a workspace requires `OWNER`.

## Data shape

```
User
  └── owns Workspace
        └── WorkspaceMember (OWNER | ADMIN | MEMBER | VIEWER)
        └── Api
              └── ApiVersion (v1, v2, …)
                    └── ApiEndpoint (GET /users, POST /orders, …)
                          ├── ApiParameter
                          ├── ApiSchema (request / response JSON)
                          └── ApiExample
                    ├── ApiChange (v1 → v2 diff)
                    └── ApiChangelog (human-readable note)
```

Each version owns its own endpoints, so v1 and v2 can be compared.

## Stack

| Layer | Choice |
|---|---|
| Frontend | React, Vite, Apollo Client, React Router, plain CSS |
| Backend | Node.js, Express, Apollo Server, GraphQL |
| Database | PostgreSQL + Prisma |
| Auth | JWT access token (8 hours) + refresh token (30 days) |

Nested fields use DataLoader so one screen does not run one SQL query per row.

## Requirements

- Node.js 18+
- PostgreSQL running locally
- An empty database named `devapi` (created in the steps below)

## Clone it and log in

The repo includes the public demo seed (`backend/prisma/seed_test.js`) and the Prisma migrations. It does not include secrets, `node_modules`, or a database. After a clone you create those locally, load the seed, and sign in with the demo accounts.

```bash
git clone <your-repo-url>
cd Graphql_api_project
```

Create the database once:

```sql
CREATE DATABASE devapi;
```

**Backend** (terminal 1):

```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your Postgres user and password. Then:

```bash
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Expected log:

```
Connected to PostgreSQL
Backend listening on http://localhost:4000
GraphQL endpoint:   http://localhost:4000/graphql
```

**Frontend** (terminal 2):

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open http://localhost:3000

The login form is prefilled. Seed password for both accounts is `Dev@123`.

| Email | Role in the demo |
|---|---|
| test@gmail.com | Owner of Acme Shop |
| test2@gmail.com | Admin on Acme Shop, owner of Payments |

Seed slugs: `acme-shop`, `payments`. Acme Shop has v1 and v2 so the changelog has breaking changes to show.

`npm run prisma:seed` from `backend/` wipes DevAPI tables and loads that demo data again. Workspaces you created in the UI are removed. Run it once after clone, and again any time you want the original Acme Shop and Payments data back.

`backend/prisma/seed_test.js` is the public test data. It is committed so a new clone can log in and click through docs, versions, and the changelog without typing them by hand. Sign-up still works if you want your own user.

`backend/prisma/seed.js` is a personal seed and is listed in `.gitignore`. It is not in the public repo. On your own machine you can still load it with `node prisma/seed.js` from the `backend` folder. That replaces the demo rows with your own accounts.

## What is not on GitHub

These stay on your machine. `.gitignore` already excludes them.

| Path | Why it is local |
|---|---|
| `backend/.env`, `frontend/.env` | Database password and JWT secrets |
| `backend/prisma/seed.js` | Personal logins. The public demo is `seed_test.js` |
| `node_modules/` | Created by `npm install` in `backend/` and `frontend/` |
| `dist/`, `coverage/`, logs, `.npm-cache/` | Build output and caches |

Copy `.env.example` to `.env` in each app. Do not commit the copied `.env` files.

## A query the UI is sending

```graphql
query {
  workspace(slug: "acme-shop") {
    name
    owner { name }
    apis {
      name
      currentVersion { version }
      endpoints {
        method
        path
        parameters { name location required }
      }
    }
  }
}
```

The same query can drop `endpoints` and the server skips that work. The type in `typeDefs.js` lists every allowed field. The query picks the subset.

## Not built yet

- Importing an OpenAPI / Swagger file
- Publishing a new version from the UI and generating the diff automatically
- Sending a live HTTP request from the docs page
- Query cost limits for production

## Project layout

```
backend/
  prisma/schema.prisma    tables
  prisma/migrations/      SQL history, committed
  prisma/seed_test.js     public demo users (test@gmail.com), committed
  src/index.js            starts HTTP + Postgres
  src/app.js              Express, POST /graphql, GET /health
  src/graphql/typeDefs.js the contract (types, queries, mutations)
  src/graphql/resolvers/  one function per field that needs work
  src/services/           business rules
  src/auth/               bcrypt, JWT, role checks
frontend/
  src/graphql/operations.js   the queries each screen sends
  src/pages/                  dashboard, docs, explorer, login
  src/apollo/client.js        POST /graphql + Authorization header
```
