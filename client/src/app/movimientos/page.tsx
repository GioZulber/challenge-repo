import { redirect } from "next/navigation";
import { getMovements } from "../../generated/sdk.gen";
import { getServerSession } from "../../lib/server-api";
import MovementsScreen from "../../screens/movements/MovementsScreen";

export default async function MovementsPage() {
  const { auth, client } = await getServerSession();
  if (auth.status === "unauthenticated") redirect("/login");

  let initialMovements = null;
  if (auth.status === "authenticated" && client) {
    const result = await getMovements({ client }).catch(() => null);
    if (result?.response?.status === 401) redirect("/login");
    initialMovements = result?.data?.movements ?? null;
  }

  return <MovementsScreen initialMovements={initialMovements} />;
}
