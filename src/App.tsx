import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SubmitExpense from "./pages/SubmitExpense";
import MyExpenses from "./pages/MyExpenses";
import PendingApprovals from "./pages/PendingApprovals";
import TeamExpenses from "./pages/TeamExpenses";
import ManageUsers from "./pages/ManageUsers";
import AllExpenses from "./pages/AllExpenses";
import ApprovalRules from "./pages/ApprovalRules";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit-expense" element={<SubmitExpense />} />
          <Route path="/my-expenses" element={<MyExpenses />} />
          <Route path="/pending-approvals" element={<PendingApprovals />} />
          <Route path="/team-expenses" element={<TeamExpenses />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/all-expenses" element={<AllExpenses />} />
          <Route path="/approval-rules" element={<ApprovalRules />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
