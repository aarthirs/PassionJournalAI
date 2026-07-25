import { JournalProvider } from "../context/JournalContext";

// Single place to compose all app-wide providers.
// Later phases add ThemeProvider, AuthProvider, QueryClientProvider here.
const AppProviders = ({ children }) => {
  return <JournalProvider>{children}</JournalProvider>;
};

export default AppProviders;
