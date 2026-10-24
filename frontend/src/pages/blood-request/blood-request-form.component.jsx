import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  InputLabel,
  SelectOptionField,
  TextAreaField,
  TextInputField,
} from "../../components/form/input.component.jsx";
import { FormSubmitButtons } from "../../components/buttons/button.component.jsx";
import { BLOOD_GROUPS } from "../../constants/blood-group.constant.js";
import { phoneSchema, requiredText } from "../../utilities/validation.jsx";
import { showError } from "../../utilities/helpers.jsx";
import bloodRequestSvc from "./blood-request.service.js";

const requestDto = Yup.object({
  patientName: requiredText("Patient name"),
  bloodGroup: Yup.string()
    .oneOf(BLOOD_GROUPS)
    .required("Choose a blood group."),
  city: requiredText("City"),
  hospital: requiredText("Hospital", 120),
  requesterName: requiredText("Your name"),
  phone: phoneSchema,
  units: Yup.number()
    .typeError("Enter the number of units.")
    .integer("Units must be a whole number.")
    .min(1)
    .max(20)
    .required("Units are required."),
  urgency: Yup.string().oneOf(["urgent", "normal"]).required(),
  message: Yup.string()
    .trim()
    .max(500, "Additional details must have at most 500 characters."),
});

const BloodRequestForm = ({ onSaved, onCancel, onPendingChange }) => {
  const [pending, setPending] = useState(false);
  const [error, setErrorMessage] = useState("");
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(requestDto),
    defaultValues: {
      patientName: "",
      bloodGroup: "O+",
      city: "",
      hospital: "",
      requesterName: "",
      phone: "",
      units: 1,
      urgency: "urgent",
      message: "",
    },
  });
  const submitEvent = async (data) => {
    if (pending) return;
    setPending(true);
    onPendingChange(true);
    setErrorMessage("");
    try {
      const response = await bloodRequestSvc.createRequest(data);
      await onSaved(response.data.data);
    } catch (exception) {
      const message =
        exception.response?.data?.message ||
        exception.message ||
        "Unable to create the request. Please try again.";
      setErrorMessage(message);
      toast.error(message);
      showError(exception, setError);
    } finally {
      setPending(false);
      onPendingChange(false);
    }
  };
  return (
    <form id="request-form" onSubmit={handleSubmit(submitEvent)} noValidate>
      <div className="modal-body">
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="form-grid">
          <div className="field">
            <InputLabel field="request-patient" labelTxt="Patient name" />
            <TextInputField
              control={control}
              name="patientName"
              id="request-patient"
              errMsg={errors.patientName?.message}
              placeholder="Patient's full name"
              maxLength={80}
              autoFocus
              disabled={pending}
            />
          </div>
          <div className="field">
            <InputLabel field="request-group" labelTxt="Blood group" />
            <SelectOptionField
              control={control}
              name="bloodGroup"
              id="request-group"
              errMsg={errors.bloodGroup?.message}
              options={BLOOD_GROUPS.map((value) => ({ value, label: value }))}
              disabled={pending}
            />
          </div>
          <div className="field">
            <InputLabel field="request-city" labelTxt="City" />
            <TextInputField
              control={control}
              name="city"
              id="request-city"
              errMsg={errors.city?.message}
              placeholder="e.g. Mumbai"
              maxLength={80}
              disabled={pending}
            />
          </div>
          <div className="field">
            <InputLabel field="request-hospital" labelTxt="Hospital" />
            <TextInputField
              control={control}
              name="hospital"
              id="request-hospital"
              errMsg={errors.hospital?.message}
              placeholder="Hospital name"
              maxLength={120}
              disabled={pending}
            />
          </div>
          <div className="field">
            <InputLabel field="request-units" labelTxt="Units needed" />
            <TextInputField
              control={control}
              name="units"
              id="request-units"
              type="number"
              errMsg={errors.units?.message}
              min={1}
              max={20}
              step={1}
              disabled={pending}
            />
          </div>
          <div className="field">
            <InputLabel field="request-urgency" labelTxt="Urgency" />
            <SelectOptionField
              control={control}
              name="urgency"
              id="request-urgency"
              errMsg={errors.urgency?.message}
              options={[
                { value: "urgent", label: "Urgent" },
                { value: "normal", label: "Normal" },
              ]}
              disabled={pending}
            />
          </div>
          <div className="field">
            <InputLabel field="request-name" labelTxt="Your name" />
            <TextInputField
              control={control}
              name="requesterName"
              id="request-name"
              errMsg={errors.requesterName?.message}
              placeholder="Contact person's full name"
              maxLength={80}
              autoComplete="name"
              disabled={pending}
            />
          </div>
          <div className="field">
            <InputLabel field="request-phone" labelTxt="Phone number" />
            <TextInputField
              control={control}
              name="phone"
              id="request-phone"
              type="tel"
              errMsg={errors.phone?.message}
              placeholder="e.g. +91 98765 43210"
              maxLength={30}
              autoComplete="tel"
              disabled={pending}
              aria-describedby="request-phone-help"
            />
            <span id="request-phone-help" className="help-text">
              Donors will use this number to contact you.
            </span>
          </div>
          <div className="field full-span">
            <InputLabel
              field="request-message"
              labelTxt="Additional details"
              optional
            />
            <TextAreaField
              control={control}
              name="message"
              id="request-message"
              errMsg={errors.message?.message}
              placeholder="Share any useful details for donors…"
              maxLength={500}
              rows={3}
              disabled={pending}
            />
          </div>
        </div>
      </div>
      <FormSubmitButtons
        loading={pending}
        onCancel={onCancel}
        submitButtonTxt="Create request"
        loadingText="Creating…"
      />
    </form>
  );
};

export default BloodRequestForm;
