"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getMovement } from "../../generated/sdk.gen";
import type { Movement } from "../../generated/types.gen";
import { usePrivateSession } from "../../hooks/usePrivateSession";
import BottomNav from "../../shared/components/BottomNav";
import BrandHeader from "../../shared/components/BrandHeader";
import MovementDetailCard from "./MovementDetailCard";

export default function MovementDetailScreen({ id, initialMovement }: { id: string; initialMovement: Movement | null }) {
  const { authStatus, user, refresh, invalidate, leaving, signOutError, handleSignOut } = usePrivateSession();
  const [movement, setMovement] = useState(initialMovement);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "not-found">(initialMovement ? "ready" : "error");
  const startedAuthenticated = useRef(authStatus === "authenticated").current;
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (authStatus !== "authenticated" || !user) return;
    if (startedAuthenticated && retry === 0) return;
    let active = true;
    setStatus("loading");
    void getMovement({ path: { id } })
      .then((result) => {
        if (!active) return;
        if (result.response?.status === 401) return invalidate();
        if (result.response?.status === 404 || result.response?.status === 400) return setStatus("not-found");
        if (!result.data) throw new Error("No se pudo cargar el movimiento.");
        setMovement(result.data);
        setStatus("ready");
      })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [authStatus, user?.id, id, retry, invalidate]);

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 pb-32 pt-7 sm:px-8 sm:pt-12 lg:px-12">
      <BrandHeader />
      <Link href="/movimientos" className="mb-8 inline-flex min-h-11 items-center gap-2 font-medium text-[#791a30] underline-offset-4 hover:underline focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-[#791a30]"><span aria-hidden="true">←</span> Volver a movimientos</Link>
      <h1 className="mb-7 text-3xl font-semibold tracking-tight sm:mb-9 sm:text-4xl">Detalle del movimiento</h1>

      {signOutError && <p role="alert" className="mb-5 rounded-lg bg-[#fce9eb] p-4 text-[#791a30]">{signOutError}</p>}
      {(authStatus === "checking" || (authStatus === "authenticated" && status === "loading")) && <p role="status" className="py-20 text-center text-[#617083]">Cargando movimiento…</p>}
      {(authStatus === "error" || (authStatus === "authenticated" && status === "error")) && (
        <section role="alert" className="mx-auto max-w-md rounded-[20px] bg-white p-8 text-center">
          <h2 className="text-2xl font-semibold">No pudimos cargar el movimiento</h2>
          <p className="mt-3 text-[#617083]">Revisá tu conexión e intentá nuevamente.</p>
          <button type="button" onClick={() => authStatus === "error" ? void refresh() : setRetry((value) => value + 1)} className="mt-7 rounded-lg bg-[#791a30] px-6 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791a30]">Reintentar</button>
        </section>
      )}
      {authStatus === "authenticated" && status === "not-found" && <p role="alert" className="rounded-[20px] bg-white p-8 text-center">Movimiento no encontrado.</p>}
      {authStatus === "authenticated" && status === "ready" && movement && <MovementDetailCard movement={movement} />}
      {authStatus === "authenticated" && user && <BottomNav onSignOut={handleSignOut} leaving={leaving} />}
    </main>
  );
}
