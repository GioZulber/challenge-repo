"use client";

import { useEffect, useRef, useState } from "react";
import { getMovements } from "../../generated/sdk.gen";
import type { Movement } from "../../generated/types.gen";
import { usePrivateSession } from "../../hooks/usePrivateSession";
import BottomNav from "../../shared/components/BottomNav";
import BrandHeader from "../../shared/components/BrandHeader";
import MovementFilters, { type MovementFilter } from "./MovementFilters";
import MovementList from "./MovementList";

export default function MovementsScreen({ initialMovements }: { initialMovements: Movement[] | null }) {
  const { authStatus, user, refresh, invalidate, leaving, signOutError, handleSignOut } = usePrivateSession();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<MovementFilter>("ALL");
  const [movements, setMovements] = useState<Movement[]>(initialMovements ?? []);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(initialMovements ? "ready" : "error");
  const startedAuthenticated = useRef(authStatus === "authenticated").current;
  const hasFetchedFromClient = useRef(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !user) return;
    if (startedAuthenticated && !hasFetchedFromClient.current && !search && type === "ALL" && retry === 0) return;
    hasFetchedFromClient.current = true;
    let active = true;
    setStatus("loading");
    void getMovements({ query: { q: search || undefined, type: type === "ALL" ? undefined : type } })
      .then((result) => {
        if (!active) return;
        if (result.response?.status === 401) return invalidate();
        if (!result.data) throw new Error("No se pudieron cargar los movimientos.");
        setMovements(result.data.movements);
        setStatus("ready");
      })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [authStatus, user?.id, search, type, retry, invalidate]);

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 pb-32 pt-7 sm:px-8 sm:pt-12 lg:px-12">
      <BrandHeader />

      {authStatus === "authenticated" && <>
        <h1 className="mb-6 text-3xl font-semibold tracking-tight sm:mb-8 sm:text-4xl">Movimientos</h1>
        <MovementFilters query={query} onQueryChange={setQuery} type={type} onTypeChange={setType} />
        {signOutError && <p role="alert" className="mb-5 rounded-lg bg-[#fce9eb] p-4 text-[#791a30]">{signOutError}</p>}
      </>}

      {(authStatus === "checking" || (authStatus === "authenticated" && (status === "loading" || query.trim() !== search))) && <p role="status" className="py-20 text-center text-[#617083]">Cargando movimientos…</p>}
      {(authStatus === "error" || (authStatus === "authenticated" && status === "error" && query.trim() === search)) && (
        <section role="alert" className="mx-auto max-w-md rounded-[20px] bg-white p-8 text-center">
          <h2 className="text-2xl font-semibold">No pudimos cargar tus movimientos</h2>
          <p className="mt-3 text-[#617083]">Revisá tu conexión e intentá nuevamente.</p>
          <button type="button" onClick={() => authStatus === "error" ? void refresh() : setRetry((value) => value + 1)} className="mt-7 rounded-lg bg-[#791a30] px-6 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791a30]">Reintentar</button>
        </section>
      )}
      {authStatus === "authenticated" && status === "ready" && query.trim() === search && <MovementList movements={movements} filtered={!!search || type !== "ALL"} />}
      {authStatus === "authenticated" && user && <BottomNav onSignOut={handleSignOut} leaving={leaving} />}
    </main>
  );
}
