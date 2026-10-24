import Icon from "../icons/icons.component.jsx";

function EmptyState({ icon = "search", title, description, children }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {children}
    </div>
  );
}

export default EmptyState;
