import { useCommunity } from "../../context/community.context.jsx";
import CommunityStats from "../../components/community/community-stats.component.jsx";
import PageHeading from "../../components/community/page-heading.component.jsx";
import Icon from "../../components/icons/icons.component.jsx";
import DonorResults from "./donor-results.component.jsx";

const DonorListPage = () => {
  const { donors, loading, refresh, openModal } = useCommunity();
  return (
    <>
      <PageHeading
        eyebrow="PEOPLE WHO MAKE A DIFFERENCE"
        title="Donor directory"
        description="A community of helping hands. Register donors and keep their details current."
        buttonText="Add donor"
        onAction={() => openModal({ type: "donor" })}
      />
      <CommunityStats />
      <section aria-labelledby="donor-results-heading">
        <div className="results-toolbar">
          <div>
            <h2 id="donor-results-heading" className="results-heading">
              Our donor community
              <span className="results-count">
                {loading ? "…" : donors.length}
              </span>
            </h2>
            <p className="results-caption">
              Keep donor information and availability up to date.
            </p>
          </div>
          <button
            className="button ghost small"
            onClick={refresh}
            disabled={loading}
          >
            <Icon name="refresh" />
            Refresh
          </button>
        </div>
        <DonorResults records={donors} loading={loading} manage />
      </section>
    </>
  );
};

export default DonorListPage;
