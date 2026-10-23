import { useState } from 'react';
import { Layout } from '../components/Layout.jsx';
import { EXAMPLE_QUERIES } from '../graphql/examples.js';
import { getAccessToken } from '../auth/storage.js';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

export function Explorer() {
  const [active, setActive] = useState(EXAMPLE_QUERIES[0].id);
  const selected = EXAMPLE_QUERIES.find((e) => e.id === active) || EXAMPLE_QUERIES[0];
  const [query, setQuery] = useState(selected.query);
  const [variables, setVariables] = useState(selected.variables);
  const [result, setResult] = useState('');
  const [running, setRunning] = useState(false);

  function loadExample(example) {
    setActive(example.id);
    setQuery(example.query);
    setVariables(example.variables);
    setResult('');
  }

  async function run() {
    setRunning(true);
    try {
      let parsed = {};
      if (variables.trim()) parsed = JSON.parse(variables);
      const token = getAccessToken();
      const res = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables: parsed }),
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (err) {
      setResult(err.message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <Layout>
      <h1 className="page-title">GraphQL Explorer</h1>
      <p className="page-lead">
        This is the same <code>POST {graphqlUrl}</code> the dashboard uses.
        Your login JWT is attached automatically. Catalog queries need a
        token; <code>login</code> / <code>register</code> do not.
      </p>

      <div className="explorer">
        <div>
          <h3 style={{ marginBottom: 10 }}>Examples</h3>
          {EXAMPLE_QUERIES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className={`example-btn${active === ex.id ? ' on' : ''}`}
              onClick={() => loadExample(ex)}
            >
              <strong style={{ display: 'block', color: 'inherit' }}>{ex.title}</strong>
              <span style={{ fontSize: '0.8rem' }}>{ex.hint}</span>
            </button>
          ))}
        </div>

        <div>
          <div className="toolbar">
            <button className="btn" type="button" onClick={run} disabled={running}>
              {running ? 'Running…' : 'Run query'}
            </button>
          </div>
          <label className="muted">Query</label>
          <textarea
            className="textarea editor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            spellCheck={false}
          />
          <label className="muted">Variables (JSON)</label>
          <textarea
            className="textarea editor"
            style={{ minHeight: 120 }}
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div>
          <label className="muted">Response</label>
          <pre className="pre" style={{ minHeight: 480 }}>
            {result || 'Press Run query. Results from Postgres show up here.'}
          </pre>
        </div>
      </div>
    </Layout>
  );
}
