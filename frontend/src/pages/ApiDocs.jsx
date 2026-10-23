import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { Layout } from '../components/Layout.jsx';
import { JsonBlock, MethodBadge } from '../components/MethodBadge.jsx';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton.jsx';
import {
  API_DOCS_QUERY,
  CREATE_ENDPOINT,
  DASHBOARD_QUERY,
  DELETE_API,
  GENERATE_CRUD,
  WORKSPACE_QUERY,
  WORKSPACES_QUERY,
} from '../graphql/operations.js';
import { useAuth } from '../auth/AuthContext.jsx';

const METHODS = [null, 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

function canManageApis(user, workspace) {
  if (!user || !workspace) return false;
  if (workspace.owner?.id === user.id) return true;
  return workspace.members?.some(
    (m) => m.user.id === user.id && (m.role === 'OWNER' || m.role === 'ADMIN')
  );
}

export function ApiDocs() {
  const { apiId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [method, setMethod] = useState(null);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [resource, setResource] = useState('');
  const [newMethod, setNewMethod] = useState('GET');
  const [newPath, setNewPath] = useState('');
  const [newSummary, setNewSummary] = useState('');

  const { data, loading, error } = useQuery(API_DOCS_QUERY, {
    variables: { id: apiId, method, search: search || null },
  });

  const refetchDocs = { query: API_DOCS_QUERY, variables: { id: apiId, method: null, search: null } };

  const [generateCrud, { loading: generating, error: genError }] = useMutation(GENERATE_CRUD, {
    refetchQueries: [refetchDocs],
  });
  const [createEndpoint, { loading: adding, error: addError }] = useMutation(CREATE_ENDPOINT, {
    refetchQueries: [refetchDocs],
  });
  const [deleteApi, { loading: deletingApi, error: deleteApiError }] = useMutation(DELETE_API);

  const api = data?.api;
  const endpoints = api?.endpoints || [];
  const active = useMemo(
    () => endpoints.find((e) => e.id === activeId) || endpoints[0],
    [endpoints, activeId]
  );

  async function onGenerate(e) {
    e.preventDefault();
    await generateCrud({ variables: { apiId, resource: resource || null } });
  }

  async function onAddEndpoint(e) {
    e.preventDefault();
    await createEndpoint({
      variables: {
        apiId,
        method: newMethod,
        path: newPath,
        summary: newSummary || null,
      },
    });
    setNewPath('');
    setNewSummary('');
  }

  return (
    <Layout>
      {loading && <p className="muted">Loading documentation…</p>}
      {error && <p className="fail">{error.message}</p>}
      {api && (
        <>
          <p className="muted">
            <Link to={`/workspaces/${api.workspace.id}`}>{api.workspace.name}</Link>
          </p>
          <div className="page-title-row">
            <h1 className="page-title">{api.name}</h1>
            {canManageApis(user, api.workspace) && (
              <ConfirmDeleteButton
                label="Delete API"
                loading={deletingApi}
                confirmMessage={`Delete “${api.name}” and all of its versions and endpoints?`}
                onConfirm={async () => {
                  await deleteApi({
                    variables: { id: apiId },
                    refetchQueries: [
                      { query: DASHBOARD_QUERY },
                      { query: WORKSPACES_QUERY, variables: { search: null } },
                      { query: WORKSPACE_QUERY, variables: { id: api.workspace.id } },
                    ],
                  });
                  navigate(`/workspaces/${api.workspace.id}`);
                }}
              />
            )}
          </div>
          <p className="page-lead">
            {api.description} Current version{' '}
            <strong>{api.currentVersion?.version}</strong>. Click a method on the
            left to see parameters, schema, and examples.
          </p>
          {deleteApiError && <p className="fail">{deleteApiError.message}</p>}

          {endpoints.length === 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h2>No endpoints yet</h2>
              <p className="muted">
                Generate the usual REST set from a resource name, or add one
                path yourself.
              </p>
              <form className="toolbar" onSubmit={onGenerate} style={{ marginTop: 10 }}>
                <input
                  className="input"
                  placeholder="Resource e.g. orders"
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                />
                <button className="btn" type="submit" disabled={generating}>
                  {generating ? 'Generating…' : 'Generate GET/POST/PUT/PATCH/DELETE'}
                </button>
              </form>
              {genError && <p className="fail">{genError.message}</p>}
            </div>
          )}

          <div className="card" style={{ marginBottom: 16 }}>
            <h2>Add another endpoint</h2>
            <form className="toolbar" onSubmit={onAddEndpoint}>
              <select
                className="select input"
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                className="input"
                placeholder="/custom-path"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Short summary"
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
              />
              <button className="btn secondary" type="submit" disabled={adding}>
                {adding ? 'Adding…' : 'Add endpoint'}
              </button>
            </form>
            {addError && <p className="fail">{addError.message}</p>}
          </div>

          <div className="toolbar">
            {METHODS.map((m) => (
              <button
                key={String(m)}
                type="button"
                className={`chip${method === m ? ' on' : ''}`}
                onClick={() => setMethod(m)}
              >
                {m || 'All'}
              </button>
            ))}
            <input
              className="input"
              placeholder="Search path or summary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link className="btn secondary" to={`/apis/${api.id}/changelog`}>
              Changelog
            </Link>
          </div>

          <div className="docs-split">
            <div className="docs-list">
              {endpoints.length === 0 && <p className="empty">No endpoints yet.</p>}
              {endpoints.map((ep) => (
                <button
                  key={ep.id}
                  type="button"
                  className="endpoint-row"
                  onClick={() => setActiveId(ep.id)}
                >
                  <MethodBadge method={ep.method} />
                  <span className="endpoint-path">{ep.path}</span>
                </button>
              ))}
            </div>

            <div className="docs-detail">
              {!active && <p className="muted">Select an endpoint.</p>}
              {active && (
                <>
                  <div className="row-between">
                    <h2>
                      <MethodBadge method={active.method} /> {active.path}
                    </h2>
                  </div>
                  <p className="muted">{active.summary}</p>
                  {active.description && <p>{active.description}</p>}

                  <h3 style={{ marginTop: 18 }}>Parameters</h3>
                  {active.parameters.length === 0 && <p className="muted">None</p>}
                  {active.parameters.map((p) => (
                    <div key={p.name + p.location} className="kv">
                      <span>
                        <code>{p.name}</code> {p.required ? '*' : ''}
                      </span>
                      <span className="muted">
                        {p.location} · {p.type}
                        {p.example ? ` · e.g. ${p.example}` : ''}
                        {p.description ? ` — ${p.description}` : ''}
                      </span>
                    </div>
                  ))}

                  <h3>Request / response schema</h3>
                  {active.schemas.length === 0 && <p className="muted">None yet</p>}
                  {active.schemas.map((s) => (
                    <div key={s.name + s.kind} style={{ marginBottom: 12 }}>
                      <p className="muted">
                        {s.kind} {s.name}
                        {s.statusCode ? ` (${s.statusCode})` : ''}
                      </p>
                      <JsonBlock value={s.json} />
                    </div>
                  ))}

                  <h3>Examples</h3>
                  {active.examples.length === 0 && <p className="muted">None yet</p>}
                  {active.examples.map((ex) => (
                    <div key={ex.name} style={{ marginBottom: 12 }}>
                      <p className="muted">
                        {ex.name} {ex.statusCode || ''}
                      </p>
                      <p className="muted">Request</p>
                      <JsonBlock value={ex.request} />
                      <p className="muted">Response</p>
                      <JsonBlock value={ex.response} />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
