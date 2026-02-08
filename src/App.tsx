import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
// import { Layout } from './components/Layout';
import { SetupPage } from './pages/SetupPage';
// import { IngestionPage } from './pages/IngestionPage';
import { LibraryPage } from './pages/LibraryPage';
// import { useStore } from './store/useStore';
// import { ToastProvider } from './components/ui/ToastContext';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  // const { config } = useStore();

  // if (!config.inboxPath || !config.libraryPath) {
  //   return <Navigate to="/setup" replace />;
  // }

  return children;
};

function App() {
  return (
    // <ToastProvider>
    <BrowserRouter>
      {/* <Layout> */}
      <Routes>
        <Route path="/" element={<SetupPage />} />

        <Route path="/library" element={<LibraryPage />} />

        {/* <Route path="/" element={
          <ProtectedRoute>
            <IngestionPage />
          </ProtectedRoute>
        } /> */}

        {/* <Route path="/library" element={
          <ProtectedRoute>
            <LibraryPage />
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
