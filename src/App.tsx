import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { TrackerPage } from './pages/TrackerPage';
import './App.css';

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-200 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-600 animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!session ? <LoginPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/*"
        element={session ? <TrackerPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
