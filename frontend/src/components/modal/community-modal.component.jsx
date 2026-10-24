import { useCommunity } from "../../context/community.context.jsx";
import { getRecordId } from "../../utilities/helpers.jsx";
import DonorForm from "../../pages/donor/donor-form.component.jsx";
import donorSvc from "../../pages/donor/donor.service.js";
import BloodRequestForm from "../../pages/blood-request/blood-request-form.component.jsx";
import BloodRequestMatches from "../../pages/blood-request/blood-request-matches.component.jsx";
import bloodRequestSvc from "../../pages/blood-request/blood-request.service.js";
import Modal from "./modal.component.jsx";
import Icon from "../icons/icons.component.jsx";

const CommunityModal = () => {
  const {
    modal,
    closeModal,
    busy,
    formPending,
    setFormPending,
    saved,
    feedback,
    mutate,
  } = useCommunity();
  if (!modal) return null;
  const deletingDonor = modal.type === "delete-donor";
  const deleting = deletingDonor || modal.type === "delete-request";
  const title =
    modal.type === "donor"
      ? modal.donor
        ? "Edit donor details"
        : "Become someone’s helping hand"
      : modal.type === "request"
        ? "Create a blood request"
        : modal.type === "matches"
          ? "People who could help"
          : "Delete this record?";
  const deleteRecord = () =>
    mutate(
      () =>
        deletingDonor
          ? donorSvc.deleteDonorById(getRecordId(modal.donor))
          : bloodRequestSvc.deleteRequestById(getRecordId(modal.request)),
      "Record deleted.",
      true,
    );

  return (
    <Modal title={title} onClose={closeModal} pending={busy || formPending}>
      {feedback && (
        <div
          className={`modal-feedback ${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          <Icon name={feedback.type === "error" ? "info" : "check"} />
          <span>{feedback.message}</span>
        </div>
      )}
      {modal.type === "donor" && (
        <DonorForm
          donor={modal.donor}
          onPendingChange={setFormPending}
          onCancel={closeModal}
          onSaved={() =>
            saved(
              modal.donor
                ? "Donor details updated."
                : "Donor registered. Thank you for being there.",
            )
          }
        />
      )}
      {modal.type === "request" && (
        <BloodRequestForm
          onPendingChange={setFormPending}
          onCancel={closeModal}
          onSaved={() =>
            saved("Blood request created. You can now find matching donors.")
          }
        />
      )}
      {modal.type === "matches" && <BloodRequestMatches modal={modal} />}
      {deleting && (
        <>
          <div className="modal-body">
            <p>
              This will remove{" "}
              {deletingDonor
                ? modal.donor.name
                : `the blood request for ${modal.request.patientName}`}{" "}
              from this project.
            </p>
            {deletingDonor && (
              <p className="help-text">
                They will no longer appear in donor searches.
              </p>
            )}
          </div>
          <div className="modal-footer">
            <button
              className="button secondary"
              disabled={busy}
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={deleteRecord}
            >
              {busy ? "Deleting…" : "Delete record"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CommunityModal;
