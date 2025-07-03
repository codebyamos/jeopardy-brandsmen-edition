
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Copy } from 'lucide-react';
import { usePasscode } from '../contexts/PasscodeContext';
import { useToast } from '../hooks/use-toast';

interface PasscodeManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

const PasscodeManager: React.FC<PasscodeManagerProps> = ({ isVisible, onClose }) => {
  const { passcode, setPasscode } = usePasscode();
  const { toast } = useToast();
  const [showPasscode, setShowPasscode] = useState(false);
  const [newPasscode, setNewPasscode] = useState(passcode);

  const handleSavePasscode = () => {
    if (newPasscode.length !== 4) {
      toast({
        title: "Invalid Passcode",
        description: "Please enter a 4-digit passcode.",
        variant: "destructive",
      });
      return;
    }

    setPasscode(newPasscode);
    toast({
      title: "Passcode Updated",
      description: "Game passcode has been successfully updated.",
    });
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(passcode);
    toast({
      title: "Copied",
      description: "Passcode copied to clipboard.",
    });
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-300 text-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-teal-700 text-xl font-bold">
            Manage Game Passcode
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Passcode Display */}
          <div>
            <Label className="text-gray-700 font-medium">Current Passcode</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type={showPasscode ? "text" : "password"}
                value={passcode}
                readOnly
                className="text-center text-xl tracking-widest bg-gray-50 border-gray-300 text-gray-800"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowPasscode(!showPasscode)}
                className="border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
              >
                {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Change Passcode */}
          <div>
            <Label htmlFor="new-passcode" className="text-gray-700 font-medium">
              Change Passcode (4 digits)
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
              onClick={handleSavePasscode}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
            >
              Update Passcode
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasscodeManager;
