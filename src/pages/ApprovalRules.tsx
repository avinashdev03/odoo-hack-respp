import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApprovalRules() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Approval Rules</h2>
          <p className="text-muted-foreground">Configure expense approval workflows</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Workflow Configuration</CardTitle>
            <CardDescription>Set up approval rules and thresholds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Approval rules configuration will be implemented here.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
