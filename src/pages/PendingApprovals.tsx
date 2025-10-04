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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";

interface PendingExpense {
  id: string;
  employee: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  description: string;
}

export default function PendingApprovals() {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch pending approvals
  const { data: expenses, isLoading, error } = useQuery<PendingExpense[]>({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8000/approvals/pending");
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Approve/Reject mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ expenseId, action }: { expenseId: string; action: "approve" | "reject" }) => {
      const response = await fetch(`http://localhost:8000/approvals/${expenseId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          reviewed_by: localStorage.getItem("userName") || "Unknown",
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      const action = variables.action;
      toast.success(
        `Expense ${action === "approve" ? "approved" : "rejected"} successfully!`,
        {
          description: `Expense ID: ${variables.expenseId}`,
        }
      );
      // Refetch the pending approvals
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      setProcessingId(null);
    },
    onError: (error, variables) => {
      console.error("Error processing approval:", error);
      toast.error(
        `Failed to ${variables.action} expense`,
        {
          description: error instanceof Error ? error.message : "Please try again later",
        }
      );
      setProcessingId(null);
    },
  });

  const handleApprove = (expenseId: string) => {
    setProcessingId(expenseId);
    approvalMutation.mutate({ expenseId, action: "approve" });
  };

  const handleReject = (expenseId: string) => {
    setProcessingId(expenseId);
    approvalMutation.mutate({ expenseId, action: "reject" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
          <p className="text-muted-foreground">Review and approve expense reports</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expenses Awaiting Approval</CardTitle>
            <CardDescription>
              Review submitted expenses from your team
              {expenses && expenses.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {expenses.length} pending
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading approvals...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="text-lg font-semibold mb-2">Failed to load approvals</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : "Unknown error occurred"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["pending-approvals"] })}
                >
                  Retry
                </Button>
              </div>
            ) : !expenses || expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No pending approvals</p>
                <p className="text-sm text-muted-foreground">
                  All expenses have been reviewed
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.employee}</TableCell>
                        <TableCell>
                          {expense.currency} {Number(expense.amount).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(expense.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{expense.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(expense.id)}
                              disabled={processingId === expense.id}
                            >
                              {processingId === expense.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(expense.id)}
                              disabled={processingId === expense.id}
                            >
                              {processingId === expense.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
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
              <strong>Note:</strong> Fetching data from{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">
                http://localhost:8000/approvals/pending
              </code>
              . Approvals sent to{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">
                POST /approvals/{"{expense_id}"}
              </code>
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
