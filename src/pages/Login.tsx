import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("Employee");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Store in localStorage (INSECURE - for demo only)
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);

    toast.success(`Logged in as ${role}`);
    
    // Navigate to appropriate page based on role
    switch (role) {
      case "Employee":
        navigate("/submit-expense");
        break;
      case "Manager":
        navigate("/pending-approvals");
        break;
      case "Admin":
        navigate("/manage-users");
        break;
      default:
        navigate("/submit-expense");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Expense Manager</CardTitle>
          <CardDescription>
            Select your role to access the dashboard
          </CardDescription>
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 mt-4">
            <p className="text-xs text-destructive font-medium">
              ⚠️ Demo Mode: This uses localStorage for authentication (insecure). 
              For production, implement proper backend authentication.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Continue to Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
