import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';

export function Guide() {
  return (
    <Layout>
      <div className="guide">
        <h1 className="page-title">Beginner guide</h1>
        <p className="page-lead">
          DevAPI is built day to day by <strong>Code With Azlo</strong> — a
          simple GraphQL app for API docs. This page is the whole mental model.
        </p>

        <h2>What problem does this solve?</h2>
        <p>
          Teams write HTTP APIs, then docs get out of date. Someone ships v2 and
          nobody can answer: what was added, what was removed, what will break
          clients?
        </p>
        <p>
          DevAPI keeps docs, versions, and a changelog in one place. You browse
          them in the UI. The UI talks to the database through <strong>GraphQL</strong>,
          not a pile of REST URLs.
        </p>

        <h2>Why GraphQL here?</h2>
        <p>API docs are a tree:</p>
        <pre className="pre">{`Workspace
  └── Api
        └── Version (v1, v2)
              └── Endpoint  GET /users
                    ├── Parameters
                    ├── Schemas
                    └── Examples`}</pre>
        <p>
          REST would need many URLs. GraphQL uses <strong>one</strong>:{' '}
          <code>POST /graphql</code>. You list only the fields you want. The
          dashboard asks for a short list. The docs page asks for the full tree.
          Same server.
        </p>

        <h2>The 2 workspaces on the dashboard</h2>
        <p>
          They are <strong>seed / dummy data</strong> so you can click around
          immediately:
        </p>
        <ul>
          <li>
            <code>acme-shop</code> — Shop API with v1 and v2 + breaking changes
          </li>
          <li>
            <code>payments</code> — Payments API (charges, refunds)
          </li>
        </ul>
        <p>
          They are not a limit. Add more with the form on Dashboard / Workspaces
          (mutation <code>createWorkspace</code>). Then open the new workspace
          and add an API (<code>createApi</code>).
        </p>

        <h2>How to work with it (simple path)</h2>
        <ol>
          <li>
            Log in. Pre-filled: <code>test@gmail.com</code> /{' '}
            <code>Dev@123</code>. The other demo account is{' '}
            <code>test2@gmail.com</code> with the same password — or{' '}
            <Link to="/register">sign up</Link>.
          </li>
          <li>Open Dashboard. You see seed workspaces.</li>
          <li>Fill <strong>Add a workspace</strong> → Create. Count goes up.</li>
          <li>Open that workspace → <strong>Add an API</strong>.</li>
          <li>
            Type a resource like <code>products</code>. The app creates GET,
            POST, PUT, PATCH, DELETE docs and opens them.
          </li>
          <li>
            On the docs page you can add more paths, or generate CRUD if the
            API was empty.
          </li>
          <li>
            Changed your mind? OWNER can <strong>Delete workspace</strong> (also
            removes every API and endpoint under it). OWNER/ADMIN can{' '}
            <strong>Delete API</strong> to drop one API only.
          </li>
          <li>
            Open <Link to="/explorer">GraphQL Explorer</Link>. Run “Nested docs”
            or “Create a workspace”.
          </li>
        </ol>

        <h2>Where login and tokens apply</h2>
        <p>This is a normal JWT setup, wired into GraphQL context.</p>
        <ol>
          <li>
            <code>register</code> / <code>login</code> — public mutations. Password
            is hashed with bcrypt. Response includes:
            <pre className="pre">{`{
  accessToken,   // send on every request (lives 8 hours)
  refreshToken,  // get a new access token later
  user
}`}</pre>
          </li>
          <li>
            Frontend stores tokens in <code>localStorage</code> and Apollo adds:
            <pre className="pre">Authorization: Bearer &lt;accessToken&gt;</pre>
          </li>
          <li>
            Backend <code>app.js</code> reads that header, verifies the JWT,
            puts <code>user</code> on GraphQL <code>context</code>.
          </li>
          <li>
            Resolvers call <code>requireUser(ctx)</code>. No token →{' '}
            <code>UNAUTHENTICATED</code>.
          </li>
          <li>
            <code>createApi</code> / <code>deleteApi</code> also check you are
            OWNER or ADMIN of that workspace (<code>requireWorkspaceRole</code>).
            <code>deleteWorkspace</code> is OWNER only.
          </li>
        </ol>
        <p>
          <strong>Public (no token):</strong> <code>health</code>,{' '}
          <code>register</code>, <code>login</code>, <code>refreshToken</code>
          <br />
          <strong>Needs login:</strong> workspaces, APIs, docs,{' '}
          <code>createWorkspace</code>, <code>createApi</code>,{' '}
          <code>deleteWorkspace</code>, <code>deleteApi</code>
        </p>

        <h2>Example: add a workspace from the Explorer</h2>
        <pre className="pre">{`mutation {
  createWorkspace(name: "My Team", description: "Learning GraphQL") {
    id
    name
    slug
  }
}`}</pre>
        <p>
          You must be logged in so the Explorer can send the Bearer token.
          After this, Dashboard refetch shows the new row — same GraphQL API,
          not a second REST server.
        </p>
        <p>
          To throw a workspace away (and everything inside it):
        </p>
        <pre className="pre">{`mutation {
  deleteWorkspace(id: "paste-workspace-id")
}`}</pre>

        <h2>Files to read (backend)</h2>
        <ul>
          <li>
            <code>src/graphql/typeDefs.js</code> — what you may query/mutate
          </li>
          <li>
            <code>src/graphql/resolvers/</code> — functions for each field
          </li>
          <li>
            <code>src/auth/</code> — password hash + JWT + requireUser
          </li>
          <li>
            <code>src/app.js</code> — attaches user + DataLoader to context
          </li>
        </ul>

        <p className="muted">
          Code With Azlo · keep it simple · GraphQL-first
        </p>
      </div>
    </Layout>
  );
}
