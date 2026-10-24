export const getRecordId = (record) => record.id || record._id;

// Both Joi detail maps and the standard API message are supported.
export const showError = (exception, setError) => {
  const details =
    exception.response?.data?.detail || exception.response?.data?.details;
  if (details && typeof details === "object" && !Array.isArray(details)) {
    Object.entries(details).forEach(([field, message]) => {
      setError(field, {
        type: "server",
        message: Array.isArray(message) ? message.join(" ") : String(message),
      });
    });
  }
};
