import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_WORKSPACE, DASHBOARD_QUERY, WORKSPACES_QUERY } from '../graphql/operations.js';

export function CreateWorkspaceForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createWorkspace, { loading, error }] = useMutation(CREATE_WORKSPACE, {
    refetchQueries: [{ query: DASHBOARD_QUERY }, { query: WORKSPACES_QUERY, variables: { search: null } }],
  });
  const [ok, setOk] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setOk('');
    const { data } = await createWorkspace({
      variables: { name, description: description || null },
    });
    setName('');
    setDescription('');
    setOk(`Created “${data.createWorkspace.name}” (slug: ${data.createWorkspace.slug}). You are the OWNER.`);
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2>Add a workspace</h2>
      <p className="muted">
        This sends mutation <code>createWorkspace</code>. You must be logged in
        (JWT). You become OWNER automatically.
      </p>
      <form className="toolbar" onSubmit={onSubmit} style={{ marginTop: 10 }}>
        <input
          className="input"
          placeholder="Name (e.g. My Team)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Create'}
        </button>
      </form>
      {error && <p className="fail">{error.message}</p>}
      {ok && <p className="ok">{ok}</p>}
    </div>
  );
}
