import { redirect } from "next/navigation";
import { getBalance, getMovements } from "../generated/sdk.gen";
import type { BalanceResponse, Movement } from "../generated/types.gen";
import { getServerSession } from "../lib/server-api";
import HomeScreen from "../screens/home/HomeScreen";

export default async function HomePage() {
  const { auth, client } = await getServerSession();
  if (auth.status === "unauthenticated") redirect("/login");

  let initialBalance: BalanceResponse | null = null;
  let initialMovements: Movement[] | null = null;
  if (auth.status === "authenticated" && client) {
    const [balance, movements] = await Promise.allSettled([getBalance({ client }), getMovements({ client })]);
    if ((balance.status === "fulfilled" && balance.value.response?.status === 401) ||
        (movements.status === "fulfilled" && movements.value.response?.status === 401)) redirect("/login");
    if (balance.status === "fulfilled") initialBalance = balance.value.data ?? null;
    if (movements.status === "fulfilled") initialMovements = movements.value.data?.movements ?? null;
  }

  return <HomeScreen initialBalance={initialBalance} initialMovements={initialMovements} />;
}
