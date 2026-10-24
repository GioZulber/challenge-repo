"use client";

import { useEffect, useRef, useState } from "react";
import { getBalance, getMovements } from "../../generated/sdk.gen";
import type { BalanceResponse, Movement } from "../../generated/types.gen";
import { usePrivateSession } from "../../hooks/usePrivateSession";
import BottomNav from "../../shared/components/BottomNav";
import BrandHeader from "../../shared/components/BrandHeader";
import BalanceCard from "./BalanceCard";
import HomeGreeting from "./HomeGreeting";
import RecentMovements from "./RecentMovements";

export default function HomeScreen({ initialBalance, initialMovements }: { initialBalance: BalanceResponse | null; initialMovements: Movement[] | null }) {
  const { authStatus, user, refresh, invalidate, leaving, signOutError, handleSignOut } = usePrivateSession();
  const [balance, setBalance] = useState<BalanceResponse | null>(initialBalance);
  const [movements, setMovements] = useState<Movement[] | null>(initialMovements);
  const [balanceStatus, setBalanceStatus] = useState<"loading" | "ready" | "error">(initialBalance ? "ready" : "error");
  const [movementsStatus, setMovementsStatus] = useState<"loading" | "ready" | "error">(initialMovements !== null ? "ready" : "error");
  const startedAuthenticated = useRef(authStatus === "authenticated").current;
  const [balanceRetry, setBalanceRetry] = useState(0);
  const [movementsRetry, setMovementsRetry] = useState(0);

  useEffect(() => {
    if (authStatus !== "authenticated" || !user) return;
    if (startedAuthenticated && balanceRetry === 0) return;
    let active = true;
    setBalanceStatus("loading");
    setBalance(null);
    void getBalance()
      .then((result) => {
        if (!active) return;
        if (result.response?.status === 401) return invalidate();
        if (!result.data) throw new Error("No se pudo cargar el saldo.");
        setBalance(result.data);
        setBalanceStatus("ready");
      })
      .catch(() => { if (active) setBalanceStatus("error"); });
    return () => { active = false; };
  }, [authStatus, user?.id, balanceRetry, invalidate]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !user) return;
    if (startedAuthenticated && movementsRetry === 0) return;
    let active = true;
    setMovementsStatus("loading");
    setMovements(null);
    void getMovements()
      .then((result) => {
        if (!active) return;
        if (result.response?.status === 401) return invalidate();
        if (!result.data) throw new Error("No se pudieron cargar los movimientos.");
        setMovements(result.data.movements);
        setMovementsStatus("ready");
      })
      .catch(() => { if (active) setMovementsStatus("error"); });
    return () => { active = false; };
  }, [authStatus, user?.id, movementsRetry, invalidate]);

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 pb-32 pt-7 sm:px-8 sm:pt-12 lg:px-12">
      <BrandHeader />

      {authStatus === "checking" && <p role="status" className="py-24 text-center text-[#617083]">Cargando tu cuenta…</p>}
      {authStatus === "error" && (
        <section role="alert" className="mx-auto max-w-md rounded-[20px] bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold">No pudimos cargar tu cuenta</h1>
          <p className="mt-3 text-[#617083]">Revisá tu conexión e intentá nuevamente.</p>
          <button type="button" onClick={() => void refresh()} className="mt-7 rounded-lg bg-[#791a30] px-6 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791a30]">Reintentar</button>
        </section>
      )}
      {authStatus === "authenticated" && user && (
        <>
          <HomeGreeting name={user.name} />
          {signOutError && <p role="alert" className="mb-5 rounded-lg bg-[#fce9eb] p-4 text-[#791a30]">{signOutError}</p>}
          <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
            {balanceStatus === "loading" && <p role="status" className="py-20 text-center text-[#617083]">Cargando saldo…</p>}
            {balanceStatus === "error" && (
              <section role="alert" className="rounded-[20px] bg-white p-8 text-center">
                <h2 className="text-xl font-semibold">No pudimos cargar tu saldo</h2>
                <p className="mt-3 text-[#617083]">Revisá tu conexión e intentá nuevamente.</p>
                <button type="button" onClick={() => setBalanceRetry((value) => value + 1)} className="mt-7 rounded-lg bg-[#791a30] px-6 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791a30]">Reintentar saldo</button>
              </section>
            )}
            {balanceStatus === "ready" && balance && <BalanceCard balance={balance} name={user.name} />}
            {movementsStatus === "loading" && <p role="status" className="py-20 text-center text-[#617083]">Cargando movimientos…</p>}
            {movementsStatus === "error" && (
              <section role="alert" className="rounded-[20px] bg-white p-8 text-center">
                <h2 className="text-xl font-semibold">No pudimos cargar tus movimientos</h2>
                <p className="mt-3 text-[#617083]">Revisá tu conexión e intentá nuevamente.</p>
                <button type="button" onClick={() => setMovementsRetry((value) => value + 1)} className="mt-7 rounded-lg bg-[#791a30] px-6 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791a30]">Reintentar movimientos</button>
              </section>
            )}
            {movementsStatus === "ready" && movements && <RecentMovements movements={movements} />}
          </div>
        </>
      )}
      {authStatus === "authenticated" && user && <BottomNav onSignOut={handleSignOut} leaving={leaving} />}
    </main>
  );
}
