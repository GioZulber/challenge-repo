import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import { getServerSession } from "../lib/server-api";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = { title: "GranaBank" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { auth } = await getServerSession();
  return (
    <html lang="es" className={poppins.className}>
      <body>
        <AuthProvider initialAuth={auth}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
