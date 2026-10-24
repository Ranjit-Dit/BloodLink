import Icon from "../../components/icons/icons.component.jsx";

function DonorCard({
  donor,
  manage,
  busy,
  onEdit,
  onAvailability,
  onDelete,
  onCopy,
}) {
  const initials = donor.name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
  return (
    <article className="donor-card">
      <div className="donor-card-top">
        <div className="avatar">{initials}</div>
        <div className="donor-meta">
          <h3 className="donor-name">{donor.name}</h3>
          <p className="donor-location">
            <Icon name="pin" />
            {[donor.area, donor.city].filter(Boolean).join(", ")}
          </p>
        </div>
        <span className="blood-badge">{donor.bloodGroup}</span>
      </div>
      <span className={`availability ${donor.available ? "" : "unavailable"}`}>
        <span />
        {donor.available ? "Available to donate" : "Currently unavailable"}
      </span>
      <div className="donor-card-bottom">
        <span className="donor-phone">
          <Icon name="phone" />
          {donor.phone}
        </span>
        <button
          className="icon-button"
          type="button"
          aria-label={`Copy ${donor.name}'s phone number`}
          title="Copy phone number"
          onClick={() => onCopy(donor.phone, "Phone number copied.")}
        >
          <Icon name="copy" />
        </button>
      </div>
      <div className="donor-actions">
        {manage ? (
          <>
            <button
              className="button secondary small"
              disabled={busy}
              onClick={() => onAvailability(donor)}
            >
              <Icon name={donor.available ? "clock" : "check"} />
              {donor.available ? "Mark unavailable" : "Mark available"}
            </button>
            <button
              className="icon-button"
              disabled={busy}
              aria-label={`Edit ${donor.name}`}
              title="Edit donor"
              onClick={() => onEdit(donor)}
            >
              <Icon name="edit" />
            </button>
            <button
              className="icon-button danger"
              disabled={busy}
              aria-label={`Delete ${donor.name}`}
              title="Delete donor"
              onClick={() => onDelete(donor)}
            >
              <Icon name="trash" />
            </button>
          </>
        ) : (
          <>
            <a
              className="button secondary full-width"
              href={`tel:${donor.phone}`}
            >
              <Icon name="phone" />
              Call donor
              <Icon name="arrow" />
            </a>
          </>
        )}
      </div>
    </article>
  );
}

export default DonorCard;
