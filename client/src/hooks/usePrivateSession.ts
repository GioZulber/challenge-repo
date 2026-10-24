"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export function usePrivateSession() {
  const router = useRouter();
  const { status: authStatus, user, refresh, invalidate, signOut } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const signingOut = useRef(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") router.replace("/login");
  }, [authStatus, router]);

  async function handleSignOut() {
    if (signingOut.current) return;
    signingOut.current = true;
    setLeaving(true);
    setSignOutError("");
    try {
      const result = await signOut();
      if (!result.response?.ok && result.response?.status !== 401) {
        setSignOutError("No pudimos cerrar sesión. Intentá de nuevo.");
      }
    } catch {
      setSignOutError("No pudimos cerrar sesión. Intentá de nuevo.");
    } finally {
      signingOut.current = false;
      setLeaving(false);
    }
  }

  return { authStatus, user, refresh, invalidate, leaving, signOutError, handleSignOut };
}
