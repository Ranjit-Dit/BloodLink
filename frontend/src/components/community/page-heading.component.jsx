import Icon from "../icons/icons.component.jsx";

const PageHeading = ({ eyebrow, title, description, buttonText, onAction }) => (
  <section className="page-heading">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p className="section-description">{description}</p>
    </div>
    <button className="button primary" onClick={onAction}>
      <Icon name="plus" />
      {buttonText}
    </button>
  </section>
);

export default PageHeading;
