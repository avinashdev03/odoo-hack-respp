import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AllExpenses() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Expenses</h2>
          <p className="text-muted-foreground">Complete overview of all company expenses</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Company Expense Reports</CardTitle>
            <CardDescription>View all expenses across the organization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Complete expense list will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
