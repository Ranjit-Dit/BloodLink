import * as Yup from "yup";

export const requiredText = (label, max = 80) =>
  Yup.string()
    .trim()
    .min(2, `${label} must have at least 2 characters.`)
    .max(max, `${label} must have at most ${max} characters.`)
    .required(`${label} is required.`);
export const phoneSchema = Yup.string()
  .trim()
  .required("Phone number is required.")
  .test(
    "phone",
    "Enter 7 to 15 digits, with an optional leading +.",
    (value) =>
      /^\+?[0-9 ()-]+$/.test(value || "") &&
      /^\+?\d{7,15}$/.test((value || "").replace(/[ ()-]/g, "")),
  );
