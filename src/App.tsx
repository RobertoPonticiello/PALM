import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import ProfileSelect from "./pages/ProfileSelect";
import Dashboard from "./pages/Dashboard";
import Log from "./pages/Log";
import Documents from "./pages/Documents";
import Checklist from "./pages/Checklist";
import Report from "./pages/Report";
import Learn from "./pages/Learn";
import AddProfile from "./pages/AddProfile";
import EnterDemo from "./pages/EnterDemo";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<ProfileSelect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log" element={<Log />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/report" element={<Report />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/add-profile" element={<AddProfile />} />
          <Route path="/demo" element={<EnterDemo />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
