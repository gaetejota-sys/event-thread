import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Forum } from "./pages/Forum";
import { CalendarPage } from "./pages/Calendar";
import { BuyAndSell } from "./pages/BuyAndSell";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import MessagesPage from "./pages/Messages";
import UserProfilePage from "./pages/UserProfile";
import Privacy from "./pages/Privacy";
import ForumRules from "./pages/ForumRules";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/buy-and-sell" element={<BuyAndSell />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/u/:id" element={<UserProfilePage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/forum-rules" element={<ForumRules />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
