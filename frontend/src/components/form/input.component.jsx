import { useController } from "react-hook-form";

export const InputLabel = ({ field, labelTxt, optional = false }) => (
  <label className="field-label" htmlFor={field}>
    {labelTxt} {optional && <span className="help-text">(optional)</span>}
  </label>
);

const FieldError = ({ id, message }) =>
  message ? (
    <span id={id} className="field-error" role="alert">
      {message}
    </span>
  ) : null;

export const TextInputField = ({
  control,
  name,
  id = name,
  errMsg,
  showError = true,
  type = "text",
  ...props
}) => {
  const { field } = useController({ control, name });
  return (
    <>
      <input
        {...field}
        {...props}
        type={type}
        id={id}
        value={field.value ?? ""}
        aria-invalid={Boolean(errMsg)}
        aria-describedby={errMsg ? `${id}-error` : props["aria-describedby"]}
      />
      {showError && <FieldError id={`${id}-error`} message={errMsg} />}
    </>
  );
};

export const SelectOptionField = ({
  control,
  name,
  id = name,
  errMsg,
  showError = true,
  options,
  placeholder,
  ...props
}) => {
  const { field } = useController({ control, name });
  return (
    <>
      <select
        {...field}
        {...props}
        id={id}
        value={field.value ?? ""}
        aria-invalid={Boolean(errMsg)}
        aria-describedby={errMsg ? `${id}-error` : undefined}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {showError && <FieldError id={`${id}-error`} message={errMsg} />}
    </>
  );
};

export const TextAreaField = ({
  control,
  name,
  id = name,
  errMsg,
  ...props
}) => {
  const { field } = useController({ control, name });
  return (
    <>
      <textarea
        {...field}
        {...props}
        id={id}
        value={field.value ?? ""}
        aria-invalid={Boolean(errMsg)}
        aria-describedby={errMsg ? `${id}-error` : undefined}
      />
      <FieldError id={`${id}-error`} message={errMsg} />
    </>
  );
};

export const CheckboxInputField = ({
  control,
  name,
  id = name,
  labelTxt,
  disabled,
}) => {
  const { field } = useController({ control, name });
  return (
    <label className="checkbox-field full-span" htmlFor={id}>
      <input
        ref={field.ref}
        name={field.name}
        id={id}
        type="checkbox"
        onBlur={field.onBlur}
        checked={Boolean(field.value)}
        onChange={(event) => field.onChange(event.target.checked)}
        disabled={disabled}
      />
      <span>{labelTxt}</span>
    </label>
  );
};
