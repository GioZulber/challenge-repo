"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "./LoginForm";

export default function LoginScreen() {
  const router = useRouter();
  const { status, refresh } = useAuth();
  const [verifyingSession, setVerifyingSession] = useState(status === "authenticated");

  useEffect(() => {
    if (verifyingSession) void refresh().finally(() => setVerifyingSession(false));
  }, [refresh, verifyingSession]);

  useEffect(() => {
    if (!verifyingSession && status === "authenticated") router.replace("/");
  }, [router, status, verifyingSession]);

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden bg-[#791a30] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span className="text-2xl font-semibold tracking-tight">GranaBank</span>
        <div className="max-w-lg">
          <p className="text-5xl font-semibold leading-tight tracking-tight">Orgullo granate en cada compra.</p>
          <p className="mt-7 text-lg text-[#f3d9de]">Tu dinero, tus movimientos y tu tranquilidad en un solo lugar.</p>
        </div>
        <span className="text-sm text-[#f3d9de]">GranaBank</span>
      </div>
      <div className="flex min-h-dvh flex-col bg-[#f7f8fa] px-5 py-8 sm:px-10 lg:min-h-0 lg:justify-center">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col lg:flex-none">
          <div className="mt-12 text-center sm:mt-20 lg:mt-0">
            <span aria-hidden="true" className="mx-auto block size-12 rounded-xl bg-[#791a30]" />
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#791a30]">GranaBank</h1>
            <p className="mt-2 text-sm text-[#617083]">Con cada compra, sumás orgullo granate</p>
          </div>
          {verifyingSession || status === "checking" || status === "authenticated" ? 
            <p role="status" className="mt-24 text-center text-[#617083]">Comprobando sesión…</p> 
            : <LoginForm />
            }
        </div>
      </div>
    </main>
  );
}
