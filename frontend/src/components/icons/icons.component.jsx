import {
  FiDroplet,
  FiSearch,
  FiMapPin,
  FiUsers,
  FiHeart,
  FiActivity,
  FiPlus,
  FiArrowRight,
  FiPhone,
  FiCopy,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiClock,
  FiHome,
  FiInfo,
  FiRefreshCw,
} from "react-icons/fi";

const icons = {
  drop: FiDroplet,
  search: FiSearch,
  pin: FiMapPin,
  users: FiUsers,
  heart: FiHeart,
  pulse: FiActivity,
  plus: FiPlus,
  arrow: FiArrowRight,
  phone: FiPhone,
  copy: FiCopy,
  edit: FiEdit2,
  trash: FiTrash2,
  close: FiX,
  check: FiCheck,
  clock: FiClock,
  building: FiHome,
  info: FiInfo,
  refresh: FiRefreshCw,
};

const Icon = ({ name, ...props }) => {
  const Component = icons[name] || FiHeart;
  return (
    <Component size={20} strokeWidth={1.7} aria-hidden="true" {...props} />
  );
};

export default Icon;
