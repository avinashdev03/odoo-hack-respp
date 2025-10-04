import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary/10 p-6">
            <DollarSign className="h-16 w-16 text-primary" />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight">Expense Manager</h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Streamline your expense tracking and approval workflow
        </p>
        <Button size="lg" onClick={() => navigate("/login")} className="mt-4">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
