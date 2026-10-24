import { useCommunity } from "../../context/community.context.jsx";
import Icon from "../icons/icons.component.jsx";

const CommunityStats = () => {
  const { available, openRequests, loading } = useCommunity();
  return (
    <section className="stats-grid" aria-label="Community overview">
      <div className="stat-card">
        <span className="stat-icon">
          <Icon name="users" />
        </span>
        <div>
          <span className="stat-value">
            {loading ? "—" : available}
            <span className="stat-dot" />
          </span>
          <span className="stat-label">Available donors</span>
        </div>
      </div>
      <div className="stat-card">
        <span className="stat-icon">
          <Icon name="pulse" />
        </span>
        <div>
          <span className="stat-value">{loading ? "—" : openRequests}</span>
          <span className="stat-label">Open blood requests</span>
        </div>
      </div>
      <div className="stat-card">
        <span className="stat-icon">
          <Icon name="drop" />
        </span>
        <div>
          <span className="stat-value">8</span>
          <span className="stat-label">Blood groups, one community</span>
        </div>
      </div>
    </section>
  );
};

export default CommunityStats;
