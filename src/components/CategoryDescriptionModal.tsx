import React from 'react';

interface CategoryDescriptionModalProps {
  category: string;
  description: string;
  isVisible: boolean;
  onClose: () => void;
  readOnly?: boolean;
  onSave?: (description: string) => void;
}

const CategoryDescriptionModal: React.FC<CategoryDescriptionModalProps> = ({
  category,
  description: initialDescription,
  isVisible,
  onClose,
  readOnly = false,
  onSave
}) => {
  const [editedDescription, setEditedDescription] = React.useState(initialDescription);
  
  React.useEffect(() => {
    setEditedDescription(initialDescription);
  }, [initialDescription]);

  if (!isVisible) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(editedDescription);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white border-2 rounded-lg w-full max-w-md max-h-[90vh] overflow-auto shadow-2xl" style={{ borderColor: '#2c5b69' }}>
        <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: '#2c5b69' }}>
          <h3 className="text-lg font-bold text-[#2c5b69]">{category.toUpperCase()}</h3>
          <button onClick={onClose} className="text-[#2c5b69] hover:text-red-400" style={{ background: 'none', border: 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2c5b69" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </span>
          </button>
        </div>
        <div className="p-4">
          {readOnly ? (
            // Read-only mode - just show the text
            <div 
              className="text-sm text-gray-700 whitespace-pre-line" 
              style={{ 
                minHeight: '120px',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                maxWidth: '100%'
              }}
            >
              {initialDescription}
            </div>
          ) : (
            // Edit mode - show textarea and save button
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <textarea
                className="w-full border rounded p-2 text-sm text-gray-700"
                style={{ minHeight: '120px' }}
                value={editedDescription}
                onChange={e => setEditedDescription(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#2c5b69] text-white rounded font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryDescriptionModal;
