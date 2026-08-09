import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { queryClient } from "../lib/queryClient";

// Theme sits outermost so it applies even to the login/welcome screens.
const AppProviders = ({ children }) => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default AppProviders;
