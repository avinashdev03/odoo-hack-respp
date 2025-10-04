import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamExpenses() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Expenses</h2>
          <p className="text-muted-foreground">View all expenses from your team</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Team Expense Reports</CardTitle>
            <CardDescription>Overview of all team member expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Team expenses list will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
