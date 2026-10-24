import { useCommunity } from "../../context/community.context.jsx";
import { getRecordId } from "../../utilities/helpers.jsx";
import Icon from "../../components/icons/icons.component.jsx";
import bloodRequestSvc from "./blood-request.service.js";

const BloodRequestCard = ({ request }) => {
  const { busy, mutate, openModal, findMatches } = useCommunity();
  return (
    <article className="request-card">
      <div className="request-card-top">
        <span className="blood-badge">{request.bloodGroup}</span>
        <div className="request-main">
          <div className="request-title">
            <h3>{request.patientName}</h3>
            <span className={`urgency-badge ${request.urgency}`}>
              {request.urgency === "urgent" ? "Urgent need" : "Normal priority"}
            </span>
          </div>
          <div className="request-details">
            <span>
              <Icon name="building" />
              {request.hospital}
            </span>
            <span>
              <Icon name="pin" />
              {request.city}
            </span>
            <span>
              <Icon name="drop" />
              {request.units} unit{request.units === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <span className={`request-status ${request.status}`}>
          {request.status}
        </span>
      </div>
      {request.message && <p className="request-note">{request.message}</p>}
      <div className="request-footer">
        <div className="request-contact">
          <span>Coordinated by {request.requesterName}</span>
          <a href={`tel:${request.phone}`}>{request.phone}</a>
        </div>
        <div className="request-controls">
          <button
            className="icon-button danger"
            disabled={busy}
            title="Delete request"
            aria-label={`Delete request for ${request.patientName}`}
            onClick={() => openModal({ type: "delete-request", request })}
          >
            <Icon name="trash" />
          </button>
          <label>
            <span className="sr-only">Status for {request.patientName}</span>
            <select
              aria-label={`Status for ${request.patientName}`}
              value={request.status}
              disabled={busy}
              onChange={(event) =>
                mutate(
                  () =>
                    bloodRequestSvc.updateStatus(
                      getRecordId(request),
                      event.target.value,
                    ),
                  "Request status updated.",
                )
              }
            >
              <option value="open">Open</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          {request.status === "open" && (
            <button
              className="button primary small"
              onClick={() => findMatches(request)}
            >
              Find donors
              <Icon name="arrow" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default BloodRequestCard;
