import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

/**
 * AuthContext — global auth state for the whole app.
 *
 * Why a context instead of prop-drilling?
 * The token and user object are needed by every protected page.
 * A context makes them available without passing props through intermediate
 * components, and provides a single logout() function that clears all state.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const IDLE_WARN_SECONDS = 13 * 60;
  const IDLE_LOGOUT_SECONDS = 15 * 60;

  const [user, setUser] = useState(() => {
    // Re-hydrate from localStorage on page reload
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [idleSeconds, setIdleSeconds] = useState(0);

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIdleSeconds(0);
  }, []);

  const resetInactivity = useCallback(() => {
    setIdleSeconds(0);
  }, []);

  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => setIdleSeconds((seconds) => seconds + 1), 1000);
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((eventName) => window.addEventListener(eventName, resetInactivity));

    return () => {
      clearInterval(timer);
      events.forEach((eventName) => window.removeEventListener(eventName, resetInactivity));
    };
  }, [user, resetInactivity]);

  useEffect(() => {
    if (!user) return;
    if (idleSeconds >= IDLE_LOGOUT_SECONDS) {
      logout();
    }
  }, [idleSeconds, user, logout]);

  const idleWarning = user ? idleSeconds >= IDLE_WARN_SECONDS : false;
  const idleRemaining = user ? Math.max(0, IDLE_LOGOUT_SECONDS - idleSeconds) : 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        idleWarning,
        idleRemaining,
        resetInactivity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook
export function useAuth() {
  return useContext(AuthContext);
}
