import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PasscodeProvider } from "./contexts/PasscodeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DatabaseCleanup from "./pages/DatabaseCleanup";

const queryClient = new QueryClient();

const App = () => {
  // Use basename only in production when deployed to /jeopardy/ subdirectory
  const basename = import.meta.env.PROD ? "/jeopardy" : "";
  
  return (
    <QueryClientProvider client={queryClient}>
      <PasscodeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={basename}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin/cleanup" element={<DatabaseCleanup />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PasscodeProvider>
    </QueryClientProvider>
  );
};

export default App;
