import { redirect } from "next/navigation";
import { getServerSession } from "../../lib/server-api";
import LoginScreen from "../../screens/login/LoginScreen";

export default async function LoginPage() {
  const { auth } = await getServerSession();
  if (auth.status === "authenticated") redirect("/");
  return <LoginScreen />;
}
