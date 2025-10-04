import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertCircle, Shield, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Employee";
}

export default function ManageUsers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserRole = localStorage.getItem("userRole");

  // Redirect if not Admin
  useEffect(() => {
    if (currentUserRole !== "Admin") {
      toast.error("Access Denied", {
        description: "Only Admins can access this page",
      });
      navigate("/");
    }
  }, [currentUserRole, navigate]);

  // Fetch users
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8000/users");
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: currentUserRole === "Admin", // Only fetch if admin
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const response = await fetch(`http://localhost:8000/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
          updated_by: localStorage.getItem("userName") || "Unknown",
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success("Role updated successfully!", {
        description: `User role changed to ${variables.newRole}`,
      });
      // Refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error, variables) => {
      console.error("Error updating role:", error);
      toast.error("Failed to update role", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
      // Revert optimistic update by refetching
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Manager":
        return "default";
      case "Employee":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // Don't render if not admin
  if (currentUserRole !== "Admin") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Manage Users
            </h2>
            <p className="text-muted-foreground">Add, edit, and manage user accounts</p>
          </div>
          {users && users.length > 0 && (
            <Badge variant="outline" className="text-base px-4 py-2">
              <UsersIcon className="h-4 w-4 mr-2" />
              {users.length} users
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and modify user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading users...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-lg font-semibold mb-2">Failed to load users</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : "Unknown error occurred"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
                >
                  Retry
                </Button>
              </div>
            ) : !users || users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No users found</p>
                <p className="text-sm text-muted-foreground">
                  No users registered in the system
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead className="text-right">Change Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                            disabled={updateRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-[140px] ml-auto">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Employee">Employee</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Fetching users from{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">
                http://localhost:8000/users
              </code>
              . Role updates sent to{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">
                PATCH /users/{"{id}"}/role
              </code>
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
