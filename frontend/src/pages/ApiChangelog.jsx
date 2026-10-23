import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Layout } from '../components/Layout.jsx';

const VERSIONS = gql`
  query ApiVersions($id: ID!) {
    api(id: $id) {
      name
      versions {
        id
        version
        isCurrent
      }
    }
  }
`;

const DIFF = gql`
  query VersionDiff($fromVersionId: ID!, $toVersionId: ID!, $toId: ID!) {
    apiChanges(fromVersionId: $fromVersionId, toVersionId: $toVersionId) {
      id
      severity
      changeType
      summary
    }
    changelog(versionId: $toId) {
      title
      body
    }
  }
`;

export function ApiChangelog() {
  const { apiId } = useParams();
  const { data, loading, error } = useQuery(VERSIONS, { variables: { id: apiId } });

  const versions = data?.api?.versions || [];
  const current = versions.find((v) => v.isCurrent) || versions[versions.length - 1];
  const previous = versions.find((v) => !v.isCurrent) || versions[0];

  const hasTwoVersions = versions.length >= 2 && previous?.id !== current?.id;

  const diffVars = useMemo(() => {
    if (!hasTwoVersions || !previous || !current) return null;
    return {
      fromVersionId: previous.id,
      toVersionId: current.id,
      toId: current.id,
    };
  }, [hasTwoVersions, previous, current]);

  const diffQuery = useQuery(DIFF, {
    variables: diffVars,
    skip: !diffVars,
  });

  const changes = diffQuery.data?.apiChanges || [];
  const log = diffQuery.data?.changelog?.[0];

  return (
    <Layout>
      {loading && <p className="muted">Loading versions…</p>}
      {error && <p className="fail">{error.message}</p>}

      {data?.api && (
        <>
          <p className="muted">
            <Link to={`/apis/${apiId}`}>{data.api.name} docs</Link>
          </p>
          <h1 className="page-title">Changelog</h1>
          <p className="page-lead">
            {hasTwoVersions
              ? `Comparing ${previous?.version} → ${current?.version}.`
              : 'This API only has v1 so far. A changelog appears after you publish a second version.'}
          </p>

          {log && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h2>{log.title}</h2>
              <pre className="pre">{log.body}</pre>
            </div>
          )}

          <div className="card">
            <h2>Detected changes</h2>
            {diffQuery.loading && <p className="muted">Loading diff…</p>}
            {changes.map((c) => (
              <div key={c.id} className="change-item">
                <span className={`severity ${c.severity}`}>{c.severity}</span>
                <div>
                  <div>{c.summary}</div>
                  <div className="muted">{c.changeType}</div>
                </div>
              </div>
            ))}
            {changes.length === 0 && hasTwoVersions && (
              <p className="muted">No stored diffs between these versions yet.</p>
            )}
            {!hasTwoVersions && (
              <p className="muted">Need two versions to compare.</p>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
