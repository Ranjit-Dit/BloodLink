import { Link, NavLink } from "react-router-dom";
import { useCommunity } from "../../context/community.context.jsx";
import Icon from "../icons/icons.component.jsx";

const Sidebar = () => {
  const { openRequests, openModal } = useCommunity();
  const nav = (to, label, icon) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
    >
      <Icon name={icon} />
      <span className="nav-label">{label}</span>
      {to === "/requests" && openRequests > 0 && (
        <span className="nav-count">{openRequests}</span>
      )}
    </NavLink>
  );
  return (
    <aside className="sidebar">
      <Link className="brand" to="/" aria-label="Bloodlink home">
        <span className="brand-mark">
          <Icon name="drop" />
        </span>
        <span>
          <span className="brand-name">
            bloodlink<span>.</span>
          </span>
          <span className="brand-tagline">
            A little of you. A life for someone.
          </span>
        </span>
      </Link>
      <div className="nav-section-label">YOUR COMMUNITY</div>
      <nav className="nav-list" aria-label="Main navigation">
        {nav("/", "Find donors", "search")}
        {nav("/requests", "Blood requests", "pulse")}
        {nav("/donors", "Donor directory", "users")}
      </nav>
      <div className="sidebar-card">
        <div className="sidebar-card-icon">
          <Icon name="heart" />
        </div>
        <h3>Someone's second chance starts with you.</h3>
        <p>Make yourself available. Be there when it matters.</p>
        <button
          className="button secondary full-width"
          onClick={() => openModal({ type: "donor" })}
        >
          Become a donor
          <Icon name="arrow" />
        </button>
      </div>
      <div className="sidebar-footer">
        <Icon name="heart" />
        <span>Small acts. Extraordinary impact.</span>
      </div>
    </aside>
  );
};

export default Sidebar;
