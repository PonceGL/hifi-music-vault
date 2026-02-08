import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
// import { Layout } from './components/Layout';
import { SetupPage } from './pages/SetupPage';
// import { IngestionPage } from './pages/IngestionPage';
import { LibraryPage } from './pages/LibraryPage';
import { useAppConfig } from './hooks/useAppConfig';
// import { ToastProvider } from './components/ui/ToastContext';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { config, isLoaded } = useAppConfig();

  // Show loading while checking config
  if (!isLoaded) {
    return (
      <div className="w-full flex flex-col justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Redirect to setup if paths are not configured
  if (!config.inboxPath || !config.libraryPath) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    // <ToastProvider>
    <BrowserRouter>
      {/* <Layout> */}
      <Routes>
        <Route path="/" element={<SetupPage />} />

        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <LibraryPage />
            </ProtectedRoute>
          }
        />

        {/* <Route path="/" element={
          <ProtectedRoute>
            <IngestionPage />
          </ProtectedRoute>
        } /> */}

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* </Layout> */}
    </BrowserRouter>
    // </ToastProvider>
  );
}

export default App;
