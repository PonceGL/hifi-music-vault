import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
// import { Layout } from './components/Layout';
import { SetupPage } from './pages/SetupPage';
import { LibraryPage } from './pages/LibraryPage';
import { useAppConfig } from './hooks/useAppConfig';
import { PlayListsPage } from './pages/PlayListsPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { TrackDetailPage } from "./pages/TrackDetailPage";

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

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* </Layout> */}
    </BrowserRouter>
  );
}

export default App;
