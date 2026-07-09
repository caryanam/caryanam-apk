import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminAuthProvider } from "./src/contexts/AdminAuthContext";
import { DealerAuthProvider } from "./src/contexts/DealerAuthContext";
import { CustomerAuthProvider } from "./src/contexts/CustomerAuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { SessionExpiredModal } from "./src/components/shared/SessionExpiredModal";
import { AuthModal } from "./src/components/shared/AuthModal";

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <DealerAuthProvider>
          <CustomerAuthProvider>
            <NavigationContainer>
              <AppNavigator />
              <SessionExpiredModal />
              <AuthModal />
            </NavigationContainer>
          </CustomerAuthProvider>
        </DealerAuthProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
