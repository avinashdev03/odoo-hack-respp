import { FileText, CheckSquare, Users, DollarSign, Settings, Receipt } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type UserRole = "Admin" | "Manager" | "Employee";

const roleMenuItems = {
  Employee: [
    { title: "Submit Expense", url: "/submit-expense", icon: Receipt },
    { title: "My Expenses", url: "/my-expenses", icon: FileText },
  ],
  Manager: [
    { title: "Pending Approvals", url: "/pending-approvals", icon: CheckSquare },
    { title: "Team Expenses", url: "/team-expenses", icon: DollarSign },
  ],
  Admin: [
    { title: "Manage Users", url: "/manage-users", icon: Users },
    { title: "All Expenses", url: "/all-expenses", icon: FileText },
    { title: "Approval Rules", url: "/approval-rules", icon: Settings },
  ],
};

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const [role, setRole] = useState<UserRole>("Employee");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as UserRole;
    if (storedRole && ["Admin", "Manager", "Employee"].includes(storedRole)) {
      setRole(storedRole);
    }
  }, []);

  const currentPath = location.pathname;
  const items = roleMenuItems[role] || roleMenuItems.Employee;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold">
            {open && `${role} Dashboard`}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-muted/50"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
