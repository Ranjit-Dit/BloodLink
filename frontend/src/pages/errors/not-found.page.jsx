import { Link } from "react-router-dom";
import EmptyState from "../../components/feedback/empty-state.component.jsx";

const NotFoundPage = () => (
  <EmptyState
    title="This page could not be found"
    description="Return to the donor finder to continue."
  >
    <Link className="button primary" to="/">
      Find donors
    </Link>
  </EmptyState>
);

export default NotFoundPage;
