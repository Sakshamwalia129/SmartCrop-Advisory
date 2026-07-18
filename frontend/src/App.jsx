import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ChatPage from './pages/ChatPage.jsx';
import AuthModal from './components/AuthModal.jsx';

function AppInner() {
  const { isAuthenticated, isLoading } = useAuth();

  // While restoring session from localStorage, show nothing (avoids flash of auth modal)
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center shadow-sm">
            <span className="text-xl leading-none">🌿</span>
          </div>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-forest-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-forest-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-forest-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard is always rendered in the background */}
      <ChatPage />

      {/* Auth modal overlays the dashboard when not authenticated */}
      {!isAuthenticated && (
        <AuthModal />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
