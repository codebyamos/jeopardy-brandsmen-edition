
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Save } from 'lucide-react';

interface CategoryEditFormProps {
  isNew: boolean;
  categoryName: string;
  onCategoryNameChange?: (name: string) => void;
  onSave: (name: string) => void;
  onCancel: () => void;
  categories: string[];
}

const CategoryEditForm: React.FC<CategoryEditFormProps> = ({
  isNew,
  categoryName,
  onCategoryNameChange,
  onSave,
  onCancel,
  categories
}) => {
  const [tempCategoryName, setTempCategoryName] = useState(categoryName);

  useEffect(() => {
    setTempCategoryName(categoryName);
  }, [categoryName, isNew]);

  const handleNameChange = (name: string) => {
    setTempCategoryName(name);
    if (onCategoryNameChange) {
      onCategoryNameChange(name);
    }
  };

  const handleSave = () => {
    onSave(tempCategoryName);
  };

  const isValidName = tempCategoryName.trim() && (isNew ? !categories.includes(tempCategoryName.trim()) : true);

  return (
    <div className="border rounded-lg p-4 sm:p-6 mb-4" style={{ backgroundColor: '#f8fafc', borderColor: '#2c5b69' }}>
      <h4 className="text-lg font-semibold mb-4" style={{ color: '#2c5b69' }}>
        {isNew ? 'Add New Category' : 'Edit Category Name'}
      </h4>
      <div className="flex gap-2">
        <input
          type="text"
          value={tempCategoryName}
          onChange={(e) => handleNameChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded text-sm sm:text-base border-2"
          style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
          placeholder="Enter category name"
          onKeyPress={(e) => e.key === 'Enter' && isValidName && handleSave()}
        />
        <Button 
          onClick={handleSave} 
          className="text-white"
          style={{ backgroundColor: '#0f766e' }}
          disabled={!isValidName}
        >
          <Save className="w-4 h-4 mr-1" />
          {isNew ? 'Add' : 'Save'}
        </Button>
        <Button 
          onClick={onCancel} 
          variant="outline" 
          className="border-2"
          style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CategoryEditForm;
