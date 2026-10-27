export default function Alert({ type = 'danger', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type} alert-dismissible`} role="alert">
      {message}
      {onClose && <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />}
    </div>
  );
}
