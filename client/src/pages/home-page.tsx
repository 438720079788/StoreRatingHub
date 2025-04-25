import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !isLoading) {
      // Redirect based on user role
      if (user.role === 'admin') {
        setLocation('/admin/dashboard');
      } else if (user.role === 'store_owner') {
        setLocation('/store-owner/dashboard');
      } else {
        setLocation('/user/stores');
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-primary">
            Store Rating Platform
          </h1>
          
          <p className="text-center mb-8 text-gray-600">
            Welcome to the Store Rating Platform. Please log in or register to continue.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button 
              className="flex-1" 
              variant="default" 
              onClick={() => setLocation('/auth')}
            >
              Login / Register
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
