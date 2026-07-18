import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMe, logoutUser } from '../api/authApi.js';

const TOKEN_KEY = 'agri_token';

// Temporary sessionStorage buffer for the OAuth token.
// React StrictMode double-invokes effects in development:
//   Run A reads oauth_token from the URL and strips the URL.
//   Run B then sees a clean URL with no oauth_token.
// We stash the token in sessionStorage during Run A so Run B can find it.
// It is removed as soon as the token is validated and stored in localStorage.
const OAUTH_HANDOFF_KEY = 'agri_oauth_pending';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true); // true while restoring session on mount

  // ── Persist helpers — stabilised with useCallback ────────────────────────────
  const storeToken = useCallback((t) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  // ── Public actions ───────────────────────────────────────────────────────────

  /** Called after a successful login or register API response */
  const login = useCallback((newToken, newUser) => {
    storeToken(newToken);
    setUser(newUser);
  }, [storeToken]);

  /** Log out — clears local state + notifies server */
  const logout = useCallback(async () => {
    clearToken();
    setUser(null);
    await logoutUser(); // fire-and-forget; server-side is stateless
  }, [clearToken]);

  // ── Session restore on mount ─────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      // ── 1. Check for OAuth redirect token ────────────────────────────────────
      // After Google/GitHub OAuth, the backend redirects to:
      //   http://localhost:5173?oauth_token=<JWT>&oauth_name=<name>&oauth_email=<email>
      //
      // StrictMode strategy:
      //   Run A: oauth_token IS in the URL → save to sessionStorage, strip URL.
      //   Run B: URL is already clean → read from sessionStorage instead.
      const params = new URLSearchParams(window.location.search);
      const urlOauthToken = params.get('oauth_token');
      const oauthError = params.get('oauth_error');

      if (urlOauthToken) {
        // Stash in sessionStorage before stripping the URL
        sessionStorage.setItem(OAUTH_HANDOFF_KEY, urlOauthToken);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (oauthError) {
        sessionStorage.removeItem(OAUTH_HANDOFF_KEY);
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Resolve token: prefer fresh URL value, then sessionStorage handoff
      const oauthToken = urlOauthToken || sessionStorage.getItem(OAUTH_HANDOFF_KEY);

      if (oauthError) {
        // OAuth failed / was cancelled — show the auth modal
        sessionStorage.removeItem(OAUTH_HANDOFF_KEY);
        if (!cancelled) setIsLoading(false);
        return;
      }

      if (oauthToken) {
        // Validate the OAuth token via /me, then log in
        try {
          const res = await fetchMe(oauthToken);
          if (res.success && res.data?.user) {
            // Always write to localStorage regardless of `cancelled` so that
            // if this invocation is cancelled by StrictMode, the sibling
            // invocation can pick up the token from localStorage (path 2 below).
            localStorage.setItem(TOKEN_KEY, oauthToken);
            sessionStorage.removeItem(OAUTH_HANDOFF_KEY);

            // Guard React state updates with the cancelled flag
            if (!cancelled) {
              setToken(oauthToken);
              setUser(res.data.user);
            }
          } else {
            sessionStorage.removeItem(OAUTH_HANDOFF_KEY);
          }
        } catch {
          // Token invalid — fall through to show auth modal
          sessionStorage.removeItem(OAUTH_HANDOFF_KEY);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
        return;
      }

      // ── 2. Normal session restore from localStorage ───────────────────────────
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const res = await fetchMe(storedToken);
        if (!cancelled && res.success && res.data?.user) {
          setUser(res.data.user);
          setToken(storedToken);
        } else if (!cancelled) {
          clearToken();
        }
      } catch {
        // Token is invalid/expired — clear it
        if (!cancelled) clearToken();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    restoreSession();
    return () => { cancelled = true; };
  // clearToken is stable (useCallback). storeToken not needed here (we call
  // localStorage.setItem directly in the OAuth path to avoid the cancelled guard).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearToken]);

  // ── Listen for 401s dispatched by the chatApi interceptor ───────────────────
  useEffect(() => {
    const handle = () => {
      clearToken();
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handle);
    return () => window.removeEventListener('auth:unauthorized', handle);
  }, [clearToken]);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to consume auth context — throws if used outside AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
