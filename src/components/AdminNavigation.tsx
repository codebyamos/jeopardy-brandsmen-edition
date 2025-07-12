import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, Database, Trash2 } from "lucide-react";

export const AdminNavigation = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          <span>Admin</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-1">
          <Link to="/admin/cleanup" className="w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-left"
            >
              <Database className="h-4 w-4 mr-2" />
              <span>Database Cleanup</span>
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};
