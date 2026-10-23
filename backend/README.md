# DevAPI backend

GraphQL API for the DevAPI docs app. One URL serves every read and write: `POST /graphql`.

Express hosts Apollo Server. Resolvers check the logged-in user, then call a service. Services use Prisma to talk to PostgreSQL.

```
POST /graphql
  → Apollo checks the query against src/graphql/typeDefs.js
  → Resolver
  → Service
  → Prisma
  → PostgreSQL
```

`GET /health` is the only REST route. It only tells you the process is up. The React app does not use it.

## What this folder owns

| Path | Job |
|---|---|
| `src/index.js` | Connects to Postgres and starts the HTTP server |
| `src/app.js` | Mounts `POST /graphql` and `GET /health` |
| `src/graphql/typeDefs.js` | Types, queries, and mutations a client is allowed to ask for |
| `src/graphql/resolvers/` | Functions Apollo runs for those fields |
| `src/services/` | Business rules (create workspace, login, diffs) |
| `src/auth/` | bcrypt passwords, JWT, role checks |
| `prisma/schema.prisma` | Tables |
| `prisma/migrations/` | SQL history |
| `prisma/seed_test.js` | Public demo data (`test@gmail.com` / `test2@gmail.com`) |

`prisma/seed.js` is a personal seed. It is gitignored and is not in this repository.

## Run it

PostgreSQL must be running, with a database named `devapi`.

```sql
CREATE DATABASE devapi;
```

From this folder:

```bash
copy .env.example .env
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Set `DATABASE_URL` in `.env` to your Postgres user and password. Do not commit `.env`.

The server listens on http://localhost:4000. GraphQL is http://localhost:4000/graphql.

Demo password for both seed accounts is `Dev@123`.

| Email | Role |
|---|---|
| test@gmail.com | Owner of Acme Shop |
| test2@gmail.com | Admin on Acme Shop, owner of Payments |

`npm run prisma:seed` wipes DevAPI tables and loads that demo again.

Start the React app from the `frontend` folder, then open http://localhost:3000.
