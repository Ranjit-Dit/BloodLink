import Icon from "../icons/icons.component.jsx";

const HomeFooter = () => (
  <>
    <div className="notice">
      <Icon name="info" />
      <p>
        Matching uses the same blood group and city. Availability is
        self-reported; the hospital confirms donor eligibility. Contact donors
        directly — no messages are sent automatically.
      </p>
    </div>
    <footer className="page-footer">
      <span>
        bloodlink<span>.</span> <span>Connecting people. Giving hope.</span>
      </span>
      <span>
        Made for your community <Icon name="heart" />
      </span>
    </footer>
  </>
);

export default HomeFooter;
