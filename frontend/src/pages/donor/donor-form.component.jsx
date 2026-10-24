import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
  CheckboxInputField,
  InputLabel,
  SelectOptionField,
  TextInputField,
} from "../../components/form/input.component.jsx";
import { FormSubmitButtons } from "../../components/buttons/button.component.jsx";
import { BLOOD_GROUPS } from "../../constants/blood-group.constant.js";
import { phoneSchema, requiredText } from "../../utilities/validation.jsx";
import { getRecordId, showError } from "../../utilities/helpers.jsx";
import donorSvc from "./donor.service.js";

const donorDto = Yup.object({
  name: requiredText("Full name"),
  bloodGroup: Yup.string()
    .oneOf(BLOOD_GROUPS)
    .required("Choose a blood group."),
  phone: phoneSchema,
  city: requiredText("City"),
  area: Yup.string().trim().max(100, "Area must have at most 100 characters."),
  available: Yup.boolean().required(),
});

const DonorForm = ({ donor = null, onSaved, onCancel, onPendingChange }) => {
  const [pending, setPending] = useState(false);
  const [error, setErrorMessage] = useState("");
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(donorDto),
    defaultValues: {
      name: donor?.name ?? "",
      bloodGroup: donor?.bloodGroup ?? "O+",
      phone: donor?.phone ?? "",
      city: donor?.city ?? "",
      area: donor?.area ?? "",
      available: donor?.available ?? true,
    },
  });

  const submitEvent = async (data) => {
    if (pending) return;
    setPending(true);
    onPendingChange(true);
    setErrorMessage("");
    try {
      const response = donor
        ? await donorSvc.editDonorById(getRecordId(donor), data)
        : await donorSvc.createDonor(data);
      await onSaved(response.data.data);
    } catch (exception) {
      const message =
        exception.response?.data?.message ||
        exception.message ||
        "Unable to save the donor. Please try again.";
      setErrorMessage(message);
      toast.error(message);
      showError(exception, setError);
    } finally {
      setPending(false);
      onPendingChange(false);
    }
  };

  return (
    <form id="donor-form" onSubmit={handleSubmit(submitEvent)} noValidate>
      <div className="modal-body">
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="form-grid">
          <div className="field">
            <InputLabel field="donor-name" labelTxt="Full name" />
            <TextInputField
              control={control}
              name="name"
              id="donor-name"
              errMsg={errors.name?.message}
              placeholder="e.g. Priya Sharma"
              maxLength={80}
              autoComplete="name"
              autoFocus
              disabled={pending}
            />
          </div>
          <div className="field">
            <InputLabel field="donor-group" labelTxt="Blood group" />
            <SelectOptionField
              control={control}
              name="bloodGroup"
              id="donor-group"
              errMsg={errors.bloodGroup?.message}
              options={BLOOD_GROUPS.map((value) => ({ value, label: value }))}
              disabled={pending}
            />
          </div>
          <div className="field">
            <InputLabel field="donor-phone" labelTxt="Phone number" />
            <TextInputField
              control={control}
              name="phone"
              id="donor-phone"
              type="tel"
              errMsg={errors.phone?.message}
              placeholder="e.g. +91 98765 43210"
              maxLength={30}
              autoComplete="tel"
              disabled={pending}
              aria-describedby="donor-phone-help"
            />
            <span id="donor-phone-help" className="help-text">
              Include your country code if needed.
            </span>
          </div>
          <div className="field">
            <InputLabel field="donor-city" labelTxt="City" />
            <TextInputField
              control={control}
              name="city"
              id="donor-city"
              errMsg={errors.city?.message}
              placeholder="e.g. Mumbai"
              maxLength={80}
              autoComplete="address-level2"
              disabled={pending}
            />
          </div>
          <div className="field full-span">
            <InputLabel field="donor-area" labelTxt="Area" optional />
            <TextInputField
              control={control}
              name="area"
              id="donor-area"
              errMsg={errors.area?.message}
              placeholder="e.g. Andheri West"
              maxLength={100}
              disabled={pending}
            />
          </div>
          <CheckboxInputField
            control={control}
            name="available"
            id="donor-available"
            labelTxt="Available to donate"
            disabled={pending}
          />
        </div>
      </div>
      <FormSubmitButtons
        loading={pending}
        onCancel={onCancel}
        submitButtonTxt={donor ? "Save changes" : "Register donor"}
      />
    </form>
  );
};

export default DonorForm;
