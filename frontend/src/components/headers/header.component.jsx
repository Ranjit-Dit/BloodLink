import { useLocation } from "react-router-dom";
import { useCommunity } from "../../context/community.context.jsx";
import Icon from "../icons/icons.component.jsx";

export const HomeHeader = () => {
  const { connected } = useCommunity();
  const { pathname } = useLocation();
  const title =
    {
      "/": "Find donors",
      "/donors": "Donor directory",
      "/requests": "Blood requests",
    }[pathname.replace(/\/+$/, "") || "/"] || "Page not found";
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Community</span>
        <span>/</span>
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <span
          className={`connection-badge ${connected === false ? "offline" : ""}`}
        >
          <span />
          {connected === null
            ? "Connecting…"
            : connected
              ? "Connected"
              : "API unavailable"}
        </span>
        <span className="header-avatar" aria-label="Community space">
          <Icon name="users" />
        </span>
      </div>
    </header>
  );
};
