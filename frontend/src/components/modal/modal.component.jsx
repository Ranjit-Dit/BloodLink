import { useEffect, useRef } from "react";
import Icon from "../icons/icons.component.jsx";

const Modal = function ({ title, children, onClose, pending }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="modal-header">
        <h2 id="modal-title" className="modal-title">
          {title}
        </h2>
        <button
          className="modal-close icon-button"
          type="button"
          onClick={onClose}
          disabled={pending}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
};

export default Modal;
