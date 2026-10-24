"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSession, login, logout } from "../generated/sdk.gen";
import type { LoginData, User } from "../generated/types.gen";
import type { InitialAuth } from "../lib/server-api";

type AuthState =
  | { status: "checking" | "unauthenticated" | "error"; user: null }
  | { status: "authenticated"; user: User };

type AuthValue = AuthState & {
  refresh: () => Promise<void>;
  signIn: (credentials: LoginData["body"]) => ReturnType<typeof login>;
  signOut: () => ReturnType<typeof logout>;
  invalidate: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children, initialAuth }: { children: ReactNode; initialAuth: InitialAuth }) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>(initialAuth);
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setAuth({ status: "checking", user: null });
    try {
      const result = await getSession();
      if (id !== requestId.current) return;
      if (result.data) setAuth({ status: "authenticated", user: result.data.user });
      else setAuth({ status: result.response?.status === 401 ? "unauthenticated" : "error", user: null });
    } catch {
      if (id === requestId.current) setAuth({ status: "error", user: null });
    }
  }, []);

  const signIn = async (credentials: LoginData["body"]) => {
    const id = ++requestId.current;
    const result = await login({ body: credentials });
    if (result.data && id === requestId.current) {
      setAuth({ status: "authenticated", user: result.data.user });
      router.refresh();
    }
    return result;
  };

  const signOut = async () => {
    const id = ++requestId.current;
    const result = await logout();
    if (id === requestId.current && (result.response?.ok || result.response?.status === 401)) {
      setAuth({ status: "unauthenticated", user: null });
      router.refresh();
    }
    return result;
  };

  const invalidate = useCallback(() => {
    requestId.current++;
    setAuth({ status: "unauthenticated", user: null });
  }, []);

  return <AuthContext.Provider value={{ ...auth, refresh, signIn, signOut, invalidate }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return auth;
}
