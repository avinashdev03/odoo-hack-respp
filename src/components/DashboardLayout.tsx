import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    const role = localStorage.getItem("userRole") || "Employee";
    setUserName(name);
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Expense Management System</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
