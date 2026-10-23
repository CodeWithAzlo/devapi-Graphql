import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Layout } from '../components/Layout.jsx';
import { CreateWorkspaceForm } from '../components/CreateWorkspaceForm.jsx';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton.jsx';
import { DASHBOARD_QUERY, DELETE_WORKSPACE, WORKSPACES_QUERY } from '../graphql/operations.js';
import { useAuth } from '../auth/AuthContext.jsx';

export function Workspaces() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState('');
  const { data, loading, error } = useQuery(WORKSPACES_QUERY, {
    variables: { search: submitted || null },
  });

  const [deleteWorkspace, { loading: deleting }] = useMutation(DELETE_WORKSPACE, {
    refetchQueries: [
      { query: DASHBOARD_QUERY },
      { query: WORKSPACES_QUERY, variables: { search: submitted || null } },
    ],
  });

  const items = data?.workspaces?.items || [];

  return (
    <Layout>
      <h1 className="page-title">Workspaces</h1>
      <p className="page-lead">
        Seed data: Acme Shop + Payments. Add more with the form below. Search
        uses GraphQL variable <code>$search</code>.
      </p>

      <CreateWorkspaceForm />

      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(search.trim());
        }}
      >
        <input
          className="input"
          placeholder="Search name, slug, description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn" type="submit">
          Search
        </button>
      </form>

      {loading && <p className="muted">Querying…</p>}
      {error && <p className="fail">{error.message}</p>}

      <p className="muted" style={{ marginBottom: 12 }}>
        {data ? `${data.workspaces.total} result(s)` : ''}
      </p>

      {items.map((ws) => (
        <div key={ws.id} className="list-card">
          <div className="row-between">
            <Link className="list-card-body" to={`/workspaces/${ws.id}`}>
              <strong>{ws.name}</strong> <span className="badge">{ws.slug}</span>
              <p className="muted">{ws.description}</p>
              <p className="muted">
                Owner {ws.owner.name} · {ws.apis.map((a) => a.name).join(', ') || 'no APIs yet'}
              </p>
            </Link>
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
    </Layout>
  );
}
