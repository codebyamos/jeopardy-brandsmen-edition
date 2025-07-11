
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import { Question } from '../types/game';
import ImageUpload from './ImageUpload';

interface QuestionEditFormProps {
  question: Question;
  onSave: (questionData: Partial<Question>) => void;
  onCancel: () => void;
}

const QuestionEditForm: React.FC<QuestionEditFormProps> = ({
  question,
  onSave,
  onCancel
}) => {
  const [tempQuestion, setTempQuestion] = useState<Partial<Question>>({ ...question });

  // Reset temp question when the question prop changes
  React.useEffect(() => {
    setTempQuestion({ ...question });
  }, [question]);

  const handleSave = () => {
    onSave(tempQuestion);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  const handleImageSelect = (imageUrl: string) => {
    setTempQuestion({ ...tempQuestion, imageUrl });
  };

  return (
    <div className="border rounded-lg p-4 sm:p-6 mb-4" style={{ backgroundColor: '#f8fafc', borderColor: '#2c5b69' }}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold" style={{ color: '#2c5b69' }}>Edit Question</h4>
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
          title="Back to categories"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Category</label>
          <input
            type="text"
            value={tempQuestion.category || ''}
            onChange={(e) => setTempQuestion({...tempQuestion, category: e.target.value})}
            className="w-full px-3 py-2 rounded text-sm sm:text-base border-2"
            style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
            placeholder="Enter category name"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Points</label>
            <select
              value={tempQuestion.points || 100}
              onChange={(e) => setTempQuestion({...tempQuestion, points: Number(e.target.value)})}
              className="w-full px-3 py-2 rounded text-sm sm:text-base border-2"
              style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
            >
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={300}>300</option>
              <option value={400}>400</option>
              <option value={500}>500</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Bonus Points</label>
            <input
              type="number"
              value={tempQuestion.bonusPoints || 0}
              onChange={(e) => setTempQuestion({...tempQuestion, bonusPoints: Number(e.target.value)})}
              className="w-full px-3 py-2 rounded text-sm sm:text-base border-2"
              style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Question</label>
          <textarea
            value={tempQuestion.question || ''}
            onChange={(e) => setTempQuestion({...tempQuestion, question: e.target.value})}
            className="w-full px-3 py-2 rounded text-sm sm:text-base h-20 border-2"
            style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
            placeholder="Enter the question"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>Answer</label>
          <textarea
            value={tempQuestion.answer || ''}
            onChange={(e) => setTempQuestion({...tempQuestion, answer: e.target.value})}
            className="w-full px-3 py-2 rounded text-sm sm:text-base h-20 border-2"
            style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
            placeholder="Enter the answer (e.g., What is...?)"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>
              Image
            </label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              currentImageUrl={tempQuestion.imageUrl}
            />
            <div className="mt-2">
              <input
                type="url"
                value={tempQuestion.imageUrl || ''}
                onChange={(e) => setTempQuestion({...tempQuestion, imageUrl: e.target.value})}
                className="w-full px-3 py-2 rounded text-sm border-2"
                style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
                placeholder="Or enter image URL"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#2c5b69' }}>
              YouTube URL (optional)
            </label>
            <input
              type="url"
              value={tempQuestion.videoUrl || ''}
              onChange={(e) => setTempQuestion({...tempQuestion, videoUrl: e.target.value})}
              className="w-full px-3 py-2 rounded text-sm sm:text-base border-2"
              style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            className="text-white"
            style={{ backgroundColor: '#0f766e' }}
            disabled={!tempQuestion.category || !tempQuestion.question || !tempQuestion.answer}
          >
            <Save className="w-4 h-4 mr-1" />
            Save Changes
          </Button>
          <Button 
            onClick={handleCancel} 
            variant="outline" 
            className="border-2"
            style={{ borderColor: '#2c5b69', color: '#2c5b69' }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Categories
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditForm;
