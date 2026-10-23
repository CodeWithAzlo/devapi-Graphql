export function MethodBadge({ method }) {
  return <span className={`method ${method}`}>{method}</span>;
}

export function JsonBlock({ value }) {
  if (value == null) return <p className="muted">None</p>;
  return <pre className="pre">{JSON.stringify(value, null, 2)}</pre>;
}
