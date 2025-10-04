import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MyExpenses() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Expenses</h2>
          <p className="text-muted-foreground">View and manage your expense reports</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
            <CardDescription>Your submitted expense reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Expense list will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
