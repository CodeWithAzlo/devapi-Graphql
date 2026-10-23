import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Layout } from '../components/Layout.jsx';
import { MethodBadge } from '../components/MethodBadge.jsx';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton.jsx';
import {
  CREATE_API,
  DASHBOARD_QUERY,
  DELETE_API,
  DELETE_WORKSPACE,
  WORKSPACE_QUERY,
  WORKSPACES_QUERY,
} from '../graphql/operations.js';
import { useAuth } from '../auth/AuthContext.jsx';

function canManageApis(user, workspace) {
  if (!user || !workspace) return false;
  if (workspace.owner?.id === user.id) return true;
  return workspace.members?.some(
    (m) => m.user.id === user.id && (m.role === 'OWNER' || m.role === 'ADMIN')
  );
}

export function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error } = useQuery(WORKSPACE_QUERY, {
    variables: { id: workspaceId },
  });
  const [name, setName] = useState('');
  const [resource, setResource] = useState('');
  const [description, setDescription] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [createApi, { loading: saving, error: saveError }] = useMutation(CREATE_API, {
    refetchQueries: [{ query: WORKSPACE_QUERY, variables: { id: workspaceId } }],
  });
  const listRefetch = [
    { query: DASHBOARD_QUERY },
    { query: WORKSPACES_QUERY, variables: { search: null } },
    { query: WORKSPACE_QUERY, variables: { id: workspaceId } },
  ];
  const [deleteWorkspace, { loading: deletingWorkspace, error: deleteWsError }] = useMutation(
    DELETE_WORKSPACE,
    { refetchQueries: listRefetch }
  );
  const [deleteApi, { loading: deletingApi, error: deleteApiError }] = useMutation(DELETE_API, {
    refetchQueries: listRefetch,
  });

  const ws = data?.workspace;

  async function onAddApi(e) {
    e.preventDefault();
    const { data: result } = await createApi({
      variables: {
        workspaceId,
        name,
        resource: resource || null,
        description: description || null,
        baseUrl: baseUrl || null,
      },
    });
    setName('');
    setResource('');
    setDescription('');
    setBaseUrl('');
    navigate(`/apis/${result.createApi.id}`);
  }

  return (
    <Layout>
      {loading && <p className="muted">Loading workspace…</p>}
      {error && <p className="fail">{error.message}</p>}
      {!loading && !ws && <p className="muted">Workspace not found.</p>}

      {ws && (
        <>
          <div className="page-title-row">
            <h1 className="page-title">{ws.name}</h1>
            {user?.id === ws.owner.id && (
              <ConfirmDeleteButton
                label="Delete workspace"
                loading={deletingWorkspace}
                confirmMessage={`Delete “${ws.name}” and every API, endpoint, schema, and example inside it? This cannot be undone.`}
                onConfirm={async () => {
                  await deleteWorkspace({ variables: { id: workspaceId } });
                  navigate('/workspaces');
                }}
              />
            )}
          </div>
          <p className="page-lead">
            {ws.description} Type a resource like <code>products</code> and we
            generate GET / POST / PUT / PATCH / DELETE docs, then open them.
          </p>
          {deleteWsError && <p className="fail">{deleteWsError.message}</p>}
          {deleteApiError && <p className="fail">{deleteApiError.message}</p>}

          <div className="card" style={{ marginBottom: 16 }}>
            <h2>Team</h2>
            <p className="muted">Owner: {ws.owner.name} ({ws.owner.email})</p>
            {ws.members.map((m) => (
              <p key={m.user.email} className="muted">
                {m.role} — {m.user.name}
              </p>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h2>Add an API (with starter REST docs)</h2>
            <p className="muted">
              Example: name <code>Products API</code>, resource{' '}
              <code>products</code> → docs for{' '}
              <code>GET /products</code>, <code>POST /products</code>,{' '}
              <code>GET /products/:id</code>, <code>PUT</code>, <code>PATCH</code>,{' '}
              <code>DELETE</code>.
            </p>
            <form onSubmit={onAddApi} className="stack-form">
              <label>API name</label>
              <input
                className="input"
                placeholder="Products API"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <label>Resource path (used in URLs)</label>
              <input
                className="input"
                placeholder="products  →  /products and /products/:id"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              />
              <label>Description (optional)</label>
              <input
                className="input"
                placeholder="What this API is for"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <label>Base URL (optional)</label>
              <input
                className="input"
                placeholder="https://api.example.com"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
              />
              <button className="btn" type="submit" disabled={saving}>
                {saving ? 'Creating docs…' : 'Create API + REST docs'}
              </button>
            </form>
            {saveError && <p className="fail">{saveError.message}</p>}
          </div>

          {ws.apis.length === 0 && (
            <p className="muted">No APIs yet. Add one above.</p>
          )}

          {ws.apis.map((api) => (
            <div key={api.id} className="card" style={{ marginBottom: 12 }}>
              <div className="row-between">
                <div>
                  <h2>{api.name}</h2>
                  <p className="muted">{api.description}</p>
                  <p className="muted">
                    {api.baseUrl} · current {api.currentVersion?.version} ·{' '}
                    {api.endpoints.length} endpoints
                  </p>
                </div>
                <div>
                  <Link className="btn" to={`/apis/${api.id}`}>
                    Open docs
                  </Link>{' '}
                  <Link className="btn secondary" to={`/apis/${api.id}/changelog`}>
                    Changelog
                  </Link>
                  {canManageApis(user, ws) && (
                    <>
                      {' '}
                      <ConfirmDeleteButton
                        label="Delete API"
                        loading={deletingApi}
                        confirmMessage={`Delete “${api.name}” and all of its versions and endpoints?`}
                        onConfirm={() => deleteApi({ variables: { id: api.id } })}
                      />
                    </>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                {api.endpoints.length === 0 && (
                  <p className="muted">No endpoints yet. Open docs to generate REST stubs.</p>
                )}
                {api.endpoints.map((ep) => (
                  <div key={ep.method + ep.path} className="endpoint-row">
                    <MethodBadge method={ep.method} />
                    <span className="endpoint-path">{ep.path}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </Layout>
  );
}
