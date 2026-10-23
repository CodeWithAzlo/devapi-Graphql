# DevAPI frontend

React dashboard for DevAPI. Screens do not call REST URLs such as `/workspaces`. Each page asks Apollo Client for the fields it needs, and Apollo sends one request:

```http
POST http://localhost:4000/graphql
Authorization: Bearer <access token>
```

A read uses `useQuery`. A write (login, create workspace, delete an API) uses `useMutation`. The body says `query` or `mutation`. The HTTP method is `POST` either way.

## What this folder owns

| Path | Job |
|---|---|
| `src/graphql/operations.js` | The queries and mutations each screen sends |
| `src/apollo/client.js` | Points at `/graphql` and attaches the JWT |
| `src/pages/` | Login, dashboard, workspaces, API docs, changelog, explorer, guide |
| `src/auth/` | Stores the access and refresh tokens in the browser |
| `src/styles/index.css` | The dark dashboard styles |

The backend must already be running on port 4000. See `backend/README.md`.

## Run it

From this folder:

```bash
copy .env.example .env
npm install
npm run dev
```

`.env` only needs:

```
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

Do not commit `.env`. Open http://localhost:3000.

The login form is filled in for the public demo. Password is `Dev@123`.

| Email | Role |
|---|---|
| test@gmail.com | Owner of Acme Shop |
| test2@gmail.com | Admin on Acme Shop, owner of Payments |

Those users exist after `npm run prisma:seed` in the `backend` folder.
