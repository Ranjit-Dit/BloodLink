import { useState } from "react";
import { useCommunity } from "../../context/community.context.jsx";
import { getRecordId } from "../../utilities/helpers.jsx";
import CommunityStats from "../../components/community/community-stats.component.jsx";
import PageHeading from "../../components/community/page-heading.component.jsx";
import EmptyState from "../../components/feedback/empty-state.component.jsx";
import Icon from "../../components/icons/icons.component.jsx";
import BloodRequestCard from "./blood-request-card.component.jsx";

const BloodRequestListPage = () => {
  const { requests, loading, openModal } = useCommunity();
  const [requestStatus, setRequestStatus] = useState("open");
  const visibleRequests = requests.filter(
    (request) => requestStatus === "all" || request.status === requestStatus,
  );
  return (
    <>
      <PageHeading
        eyebrow="BE THERE WHEN IT MATTERS"
        title="Blood requests"
        description="Find a match, connect with a donor, and keep each request up to date."
        buttonText="Request blood"
        onAction={() => openModal({ type: "request" })}
      />
      <CommunityStats />
      <section aria-labelledby="requests-heading">
        <div className="results-toolbar">
          <div>
            <h2 id="requests-heading" className="results-heading">
              Community requests
              <span className="results-count">
                {loading ? "…" : visibleRequests.length}
              </span>
            </h2>
            <p className="results-caption">
              Urgent requests appear first. Every connection counts.
            </p>
          </div>
          <label className="request-filter">
            <span className="sr-only">Filter requests by status</span>
            <select
              value={requestStatus}
              onChange={(event) => setRequestStatus(event.target.value)}
            >
              <option value="open">Open requests</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All requests</option>
            </select>
          </label>
        </div>
        {loading ? (
          <div
            className="skeleton-card"
            role="status"
            aria-label="Loading requests"
          />
        ) : visibleRequests.length ? (
          <div className="request-list">
            {visibleRequests.map((request) => (
              <BloodRequestCard key={getRecordId(request)} request={request} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="heart"
            title={
              requests.length
                ? "No requests with this status"
                : "Every request is a chance to help"
            }
            description="Create a blood request to find available donors in the same city and blood group."
          >
            <button
              className="button primary"
              onClick={() => openModal({ type: "request" })}
            >
              <Icon name="plus" />
              Create a request
            </button>
          </EmptyState>
        )}
      </section>
    </>
  );
};

export default BloodRequestListPage;
