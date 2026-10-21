import Button from "./Button";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        {children}
        <Button onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}
