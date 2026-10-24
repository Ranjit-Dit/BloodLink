import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/sidebar.component.jsx";
import { HomeHeader } from "../../components/headers/header.component.jsx";
import HomeFooter from "../../components/footers/footer.component.jsx";
import CommunityModal from "../../components/modal/community-modal.component.jsx";
import Icon from "../../components/icons/icons.component.jsx";
import { useCommunity } from "../../context/community.context.jsx";

const HomePageLayout = () => {
  const { error, refresh } = useCommunity();
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-shell">
        <HomeHeader />
        <div className="page-content">
          {error && (
            <div className="error-banner" role="alert">
              <Icon name="info" />
              <span>{error}</span>
              <button className="button ghost small" onClick={refresh}>
                Try again
              </button>
            </div>
          )}
          <Outlet />
          <HomeFooter />
        </div>
      </main>
      <CommunityModal />
    </div>
  );
};

export default HomePageLayout;
