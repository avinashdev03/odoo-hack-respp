import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useState } from "react";

const expenseFormSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  currency: z.string().min(1, "Currency is required"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  date: z.date({
    required_error: "Expense date is required",
  }),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function SubmitExpense() {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: "",
      currency: "USD",
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, WEBP, and PDF files are allowed");
        return;
      }
      setReceiptFile(file);
      toast.success("Receipt uploaded successfully");
    }
  };

  const onSubmit = async (data: ExpenseFormValues) => {
    if (!receiptFile) {
      toast.error("Please upload a receipt");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("amount", data.amount);
      formData.append("currency", data.currency);
      formData.append("description", data.description);
      formData.append("date", data.date.toISOString());
      formData.append("receipt", receiptFile);
      formData.append("user_id", localStorage.getItem("userName") || "Unknown");

      // Call the API
      const response = await fetch("http://localhost:8000/expenses", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      toast.success("Expense submitted successfully!", {
        description: `Expense ID: ${result.id || "N/A"}`,
      });

      // Clear form
      form.reset({
        amount: "",
        currency: "USD",
        description: "",
      });
      setReceiptFile(null);
      
      // Clear file input
      const fileInput = document.getElementById("receipt-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

    } catch (error) {
      console.error("Error submitting expense:", error);
      toast.error("Failed to submit expense", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submit Expense</h2>
          <p className="text-muted-foreground">Create a new expense report</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Expense Form</CardTitle>
            <CardDescription>Fill out the details for your expense</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Amount and Currency Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date Picker */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expense Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("2020-01-01")
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Select the date when the expense occurred
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the expense in detail..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a detailed description (10-500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Receipt Upload */}
                <div className="space-y-2">
                  <Label htmlFor="receipt-upload">Receipt Upload</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="receipt-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {receiptFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {receiptFile.name} ({(receiptFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Max file size: 5MB. Supported formats: JPG, PNG, WEBP, PDF
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Expense"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setReceiptFile(null);
                      const fileInput = document.getElementById("receipt-upload") as HTMLInputElement;
                      if (fileInput) fileInput.value = "";
                    }}
                    disabled={isSubmitting}
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> The form will submit to{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">
                http://localhost:8000/expenses
              </code>
              . Make sure your FastAPI backend is running on port 8000.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
