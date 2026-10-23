import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Layout } from '../components/Layout.jsx';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton.jsx';
import { DASHBOARD_QUERY, DELETE_WORKSPACE, WORKSPACES_QUERY } from '../graphql/operations.js';
import { CreateWorkspaceForm } from '../components/CreateWorkspaceForm.jsx';
import { useAuth } from '../auth/AuthContext.jsx';

export function Dashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(DASHBOARD_QUERY);
  const db = data?.health?.database;
  const workspaces = data?.workspaces?.items || [];

  const [deleteWorkspace, { loading: deleting }] = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [
      { query: DASHBOARD_QUERY },
      { query: WORKSPACES_QUERY, variables: { search: null } },
    ],
  });

  return (
    <Layout>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-lead">
        The two workspaces you see first are <strong>demo seed data</strong>{' '}
        (Acme Shop + Payments). Add your own with the form — that is a GraphQL{' '}
        <code>createWorkspace</code> mutation. Built by Code With Azlo.
      </p>

      {loading && <p className="muted">Loading from GraphQL…</p>}
      {error && <p className="fail">{error.message}</p>}

      {db && (
        <div className="grid-2">
          <div className="stat-card">
            <div className="label">Postgres</div>
            <div className={`value ${db.connected ? 'ok' : 'fail'}`}>
              {db.connected ? 'Connected' : 'Down'}
            </div>
          </div>
          <div className="stat-card">
            <div className="label">Workspaces</div>
            <div className="value">{db.workspaces}</div>
          </div>
          <div className="stat-card">
            <div className="label">APIs</div>
            <div className="value">{db.apis}</div>
          </div>
          <div className="stat-card">
            <div className="label">Endpoints</div>
            <div className="value">{db.endpoints}</div>
          </div>
        </div>
      )}

      <CreateWorkspaceForm />

      <div className="card">
        <h2>Workspaces</h2>
        {workspaces.map((ws) => (
          <div key={ws.id} className="list-card">
            <div className="row-between">
              <Link className="list-card-body" to={`/workspaces/${ws.id}`}>
                <strong>{ws.name}</strong>
                <p className="muted">{ws.description}</p>
              </Link>
              <span className="badge">{ws.apis.length} APIs</span>
              {user?.id === ws.owner.id && (
                <ConfirmDeleteButton
                  label="Delete"
                  loading={deleting}
                  confirmMessage={`Delete “${ws.name}” and every API, endpoint, schema, and example inside it? This cannot be undone.`}
                  onConfirm={() => deleteWorkspace({ variables: { id: ws.id } })}
                />
              )}
            </div>
          </div>
        ))}
        <p className="muted" style={{ marginTop: 12 }}>
          New here? Read the <Link to="/guide">beginner guide</Link>.
        </p>
      </div>
    </Layout>
  );
}
