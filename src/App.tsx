import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Layout } from './components/layout/Layout';
import { SetupPage } from './pages/SetupPage';
import { LibraryPage } from './pages/LibraryPage';
import { InboxPage } from './pages/InboxPage';
import { useAppConfig } from './hooks/useAppConfig';
import { PlayListsPage } from './pages/PlayListsPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { TrackDetailPage } from "./pages/TrackDetailPage";
import { PlaylistRefreshProvider } from "./components/Providers/PlaylistRefreshProvider";

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
    return <Navigate to="/settings" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <PlaylistRefreshProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <LibraryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <InboxPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/playlists"
              element={
                <ProtectedRoute>
                  <PlayListsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playlists/:name"
              element={
                <ProtectedRoute>
                  <PlaylistDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/track/:trackPath"
              element={
                <ProtectedRoute>
                  <TrackDetailPage />
                </ProtectedRoute>
              }
            />

            <Route path="/settings" element={<SetupPage />} />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

        </Routes>
      </PlaylistRefreshProvider>
    </BrowserRouter>
  );
}

export default App;
