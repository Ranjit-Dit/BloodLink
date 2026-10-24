export const FormSubmitButtons = ({
  loading,
  onCancel,
  submitButtonTxt = "Save",
  loadingText = "Saving…",
}) => (
  <div className="modal-footer">
    <button
      className="button secondary"
      type="button"
      onClick={onCancel}
      disabled={loading}
    >
      Cancel
    </button>
    <button className="button primary" type="submit" disabled={loading}>
      {loading ? loadingText : submitButtonTxt}
    </button>
  </div>
);
