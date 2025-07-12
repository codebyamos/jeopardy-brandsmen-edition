
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { usePasscode } from '../contexts/PasscodeContext';
import { useToast } from '../hooks/use-toast';

interface NewGameSettingsProps {
  isVisible: boolean;
  onClose: () => void;
  onStartNewGame: (newPasscode: string) => void;
}

const NewGameSettings: React.FC<NewGameSettingsProps> = ({
  isVisible,
  onClose,
  onStartNewGame
}) => {
  const { passcode } = usePasscode();
  const { toast } = useToast();
  const [newPasscode, setNewPasscode] = useState(passcode);

  const handleStartNewGame = () => {
    if (newPasscode && newPasscode.length !== 4) {
      toast({
        title: "Invalid Passcode",
        description: "Please enter a 4-digit passcode.",
        variant: "destructive",
      });
      return;
    }

    // If newPasscode is same as current passcode, just pass undefined
    // to indicate we're keeping the same passcode
    const passToUse = newPasscode !== passcode ? newPasscode : undefined;
    
    onStartNewGame(passToUse);
    toast({
      title: "New Game Started",
      description: passToUse ? 
        "All scores and questions have been reset. New passcode has been set." : 
        "All scores and questions have been reset. Keeping the same passcode.",
      duration: 5000, // Show for longer
    });
    onClose();
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-teal-700 text-xl font-bold">
            Start New Game
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Warning:</strong> This will reset all player scores, answered questions, 
              and restore the original game questions. This action cannot be undone.
            </p>
          </div>

          <div>
            <Label htmlFor="new-passcode" className="text-gray-700 font-medium">
              Set New Game Passcode (4 digits)
            </Label>
            <Input
              id="new-passcode"
              type="password"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter new 4-digit passcode"
              className="text-center text-xl tracking-widest bg-white border-gray-300 text-gray-800 mt-2"
              maxLength={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartNewGame}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Start New Game
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewGameSettings;
