import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import AdminDashboard from "./pages/admin/dashboard";
import AdminUsers from "./pages/admin/users";
import AdminStores from "./pages/admin/stores";
import UserStores from "./pages/user/stores";
import UserRatings from "./pages/user/ratings";
import UserProfile from "./pages/user/profile";
import StoreOwnerDashboard from "./pages/store-owner/dashboard";
import StoreOwnerStores from "./pages/store-owner/stores";
import StoreOwnerProfile from "./pages/store-owner/profile";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Common routes */}
      <ProtectedRoute path="/" component={HomePage} />
      
      {/* Admin routes */}
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} roles={['admin']} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} roles={['admin']} />
      <ProtectedRoute path="/admin/stores" component={AdminStores} roles={['admin']} />
      
      {/* User routes */}
      <ProtectedRoute path="/user/stores" component={UserStores} roles={['user', 'admin']} />
      <ProtectedRoute path="/user/ratings" component={UserRatings} roles={['user', 'admin']} />
      <ProtectedRoute path="/user/profile" component={UserProfile} roles={['user', 'admin']} />
      
      {/* Store Owner routes */}
      <ProtectedRoute path="/store-owner/dashboard" component={StoreOwnerDashboard} roles={['store_owner', 'admin']} />
      <ProtectedRoute path="/store-owner/stores" component={StoreOwnerStores} roles={['store_owner', 'admin']} />
      <ProtectedRoute path="/store-owner/profile" component={StoreOwnerProfile} roles={['store_owner', 'admin']} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
