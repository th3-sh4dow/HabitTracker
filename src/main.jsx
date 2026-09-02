import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

import EvergreenHabitLanding from './pages/EvergreenHabitLanding.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NewHabitPage from './components/NewHabitPage.jsx'
import SettingsPage from './components/Settings.jsx'
import App from './App.jsx'

/**
 * Route guard: redirect to /login if not authenticated.
 */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a subtle loading state while validating stored token
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9faf6',
          fontFamily: 'Inter, sans-serif',
          color: '#717973',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>
          progress_activity
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Redirect logged-in users away from auth pages.
 */
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <EvergreenHabitLanding />,
      },
      {
        path: '/login',
        element: <GuestOnly><LoginPage /></GuestOnly>,
      },
      {
        path: '/register',
        element: <GuestOnly><RegisterPage /></GuestOnly>,
      },
      {
        path: '/dashboard',
        element: <RequireAuth><Dashboard /></RequireAuth>,
      },
      {
        path: '/create',
        element: <RequireAuth><NewHabitPage /></RequireAuth>,
      },
      {
        path: '/setting',
        element: <RequireAuth><SettingsPage /></RequireAuth>,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
