import { useCommunity } from "../../context/community.context.jsx";
import { getRecordId } from "../../utilities/helpers.jsx";
import EmptyState from "../../components/feedback/empty-state.component.jsx";
import Icon from "../../components/icons/icons.component.jsx";
import DonorCard from "./donor-card.component.jsx";
import donorSvc from "./donor.service.js";

const DonorResults = ({ records, loading, error = "", manage = false }) => {
  const {
    donors,
    error: communityError,
    refresh,
    openModal,
    busy,
    mutate,
    copy,
    demoBusy,
    loadDemo,
  } = useCommunity();
  if (error)
    return (
      <div className="error-banner" role="alert">
        {error}
        <button className="button ghost small" onClick={refresh}>
          Try again
        </button>
      </div>
    );
  if (loading)
    return (
      <div className="skeleton-grid" aria-label="Loading donors" role="status">
        {[1, 2, 3].map((n) => (
          <div key={n} className="skeleton-card" />
        ))}
      </div>
    );
  if (records.length)
    return (
      <div className="donor-grid">
        {records.map((donor) => (
          <DonorCard
            key={getRecordId(donor)}
            donor={donor}
            manage={manage}
            busy={busy}
            onEdit={(record) => openModal({ type: "donor", donor: record })}
            onAvailability={(record) =>
              mutate(
                () =>
                  donorSvc.updateAvailability(
                    getRecordId(record),
                    !record.available,
                  ),
                "Donor availability updated.",
              )
            }
            onDelete={(record) =>
              openModal({ type: "delete-donor", donor: record })
            }
            onCopy={copy}
          />
        ))}
      </div>
    );
  return (
    <EmptyState
      title={
        donors.length
          ? "No donors match this search"
          : "A community starts with one person"
      }
      description={
        donors.length
          ? "Try another city or blood group, or include unavailable donors."
          : "Register a donor to get started, or explore with fictional demo records."
      }
    >
      <button
        className="button primary"
        onClick={() => openModal({ type: "donor" })}
      >
        <Icon name="plus" />
        Register a donor
      </button>
      {!donors.length && !communityError && (
        <button
          className="button secondary"
          disabled={demoBusy}
          onClick={loadDemo}
        >
          {demoBusy ? "Loading…" : "Load demo data"}
        </button>
      )}
    </EmptyState>
  );
};

export default DonorResults;
