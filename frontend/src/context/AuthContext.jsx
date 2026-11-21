import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler, tokenStore } from '../api/client.js';
import { authApi } from '../api/endpoints.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  /** After login / reset password / accept invitation: the API returns { token, user }. */
  const startSession = useCallback(({ token, user: u }) => {
    tokenStore.set(token);
    setUser(u);
    return u;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout); // any 401 from the API logs out
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    authApi
      .me()
      .then(({ user: u }) => setUser(u))
      .catch(() => tokenStore.set(null))
      .finally(() => setReady(true));
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      ready,
      startSession,
      logout,
      login: async (email, password) => startSession(await authApi.login(email, password)),
    }),
    [user, ready, startSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
