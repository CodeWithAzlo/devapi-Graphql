export function ConfirmDeleteButton({ label, confirmMessage, loading, disabled, onConfirm }) {
  async function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || loading) return;
    if (!window.confirm(confirmMessage)) return;
    await onConfirm();
  }

  return (
    <button
      type="button"
      className="btn danger"
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading ? 'Deleting…' : label}
    </button>
  );
}
