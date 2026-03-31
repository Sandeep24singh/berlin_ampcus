import { createContext, useEffect, useState } from "react";
import { login, register } from "../api/auth";
import { setAuthToken } from "../api/client";

export const AuthContext = createContext(null);

const STORAGE_KEY = "clean-stream-auth";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const persisted = localStorage.getItem(STORAGE_KEY);
    return persisted ? JSON.parse(persisted) : { token: "", user: null };
  });

  useEffect(() => {
    if (authState?.token) {
      setAuthToken(authState.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
      return;
    }

    setAuthToken("");
    localStorage.removeItem(STORAGE_KEY);
  }, [authState]);

  const value = {
    token: authState.token,
    user: authState.user,
    isAuthenticated: Boolean(authState.token),
    isModerator: authState.user?.role === "MODERATOR",
    async signIn(credentials) {
      const result = await login(credentials);
      setAuthState(result);
      return result;
    },
    async signUp(payload) {
      const result = await register(payload);
      setAuthState(result);
      return result;
    },
    signOut() {
      setAuthState({ token: "", user: null });
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
