import { useCommunity } from "../../context/community.context.jsx";
import { getRecordId } from "../../utilities/helpers.jsx";
import EmptyState from "../../components/feedback/empty-state.component.jsx";
import Icon from "../../components/icons/icons.component.jsx";

const BloodRequestMatches = ({ modal }) => {
  const { copy, closeModal } = useCommunity();
  return (
    <>
      <div className="modal-body">
        <div className="request-summary">
          <span className="blood-badge small">{modal.request.bloodGroup}</span>
          <div>
            <strong>{modal.request.patientName}</strong>
            <p>
              {modal.request.units} unit(s) · {modal.request.hospital},{" "}
              {modal.request.city}
            </p>
          </div>
        </div>
        <p className="help-text">
          Available donors with the same blood group and city. Copy a message
          and contact them directly.
        </p>
        {modal.loading ? (
          <p role="status" className="help-text">
            Finding matching donors…
          </p>
        ) : modal.error ? (
          <p className="form-error" role="alert">
            {modal.error}
          </p>
        ) : modal.donors.length ? (
          <div className="matches-list">
            {modal.donors.map((donor) => (
              <article className="match-card" key={getRecordId(donor)}>
                <div className="match-header">
                  <strong>{donor.name}</strong>
                  <span className="availability">
                    <span />
                    Available
                  </span>
                </div>
                <p className="match-message break-words">
                  {donor.contactMessage}
                </p>
                <div className="contact-row">
                  <a
                    className="button primary small"
                    href={`tel:${donor.phone}`}
                  >
                    <Icon name="phone" />
                    {donor.phone}
                  </a>
                  <button
                    className="button secondary small"
                    onClick={() => copy(donor.contactMessage)}
                  >
                    <Icon name="copy" />
                    Copy message
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No available matches yet"
            description="Try checking again later. Donors can update their availability in the directory."
          />
        )}
      </div>
      <div className="modal-footer">
        <button className="button secondary" onClick={closeModal}>
          Done
        </button>
      </div>
    </>
  );
};

export default BloodRequestMatches;
