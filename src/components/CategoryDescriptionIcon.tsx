import React from 'react';
import { Eye } from 'lucide-react';

interface Props {
  onClick: () => void;
}

const CategoryDescriptionIcon: React.FC<Props> = ({ onClick }) => (
  <button
    onClick={onClick}
    title="Show full description"
    style={{ background: 'none', border: 'none', padding: 0, marginLeft: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    className="category-description-icon-btn"
  >
    <Eye size={13} color="#fff" style={{ verticalAlign: 'middle' }} />
  </button>
);

export default CategoryDescriptionIcon;
