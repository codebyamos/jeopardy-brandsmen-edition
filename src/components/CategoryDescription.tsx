
import React from 'react';

interface CategoryDescriptionProps {
  category: string;
  description?: string;
  onDescriptionUpdate: (category: string, description: string) => void;
  isEditing: boolean;
  onEditToggle: () => void;
}

const CategoryDescription: React.FC<CategoryDescriptionProps> = ({
  category,
  description,
  onDescriptionUpdate,
  isEditing,
  onEditToggle
}) => {
  const [tempDescription, setTempDescription] = React.useState(description || '');

  const handleSave = () => {
    onDescriptionUpdate(category, tempDescription);
    onEditToggle();
  };

  const handleCancel = () => {
    setTempDescription(description || '');
    onEditToggle();
  };

  if (isEditing) {
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded border-2" style={{ borderColor: '#2c5b69' }}>
        <textarea
          value={tempDescription}
          onChange={(e) => setTempDescription(e.target.value)}
          className="w-full p-2 text-xs border rounded resize-none"
          style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
          placeholder="Add category description..."
          rows={3}
        />
        <div className="flex gap-1 mt-2">
          <button
            onClick={handleSave}
            className="px-2 py-1 text-xs text-white rounded"
            style={{ backgroundColor: '#0f766e' }}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 text-xs border rounded"
            style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {description ? (
        <div
          className="text-xs text-gray-600 italic cursor-pointer hover:bg-gray-100 p-1 rounded"
          onClick={onEditToggle}
          title="Click to edit description"
        >
          {description}
        </div>
      ) : (
        <div
          className="text-xs text-gray-400 italic cursor-pointer hover:bg-gray-100 p-1 rounded"
          onClick={onEditToggle}
          title="Click to add description"
        >
          + Add description
        </div>
      )}
    </div>
  );
};

export default CategoryDescription;
