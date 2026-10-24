import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon } from "@solar-icons/react/broken/home";
import { DocumentIcon } from "@solar-icons/react/broken/document";
import { LogoutIcon } from "@solar-icons/react/broken/logout";

export default function BottomNav({ onSignOut, leaving }: { onSignOut: () => void; leaving: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-6xl rounded-t-[20px] bg-white px-4 pb-[env(safe-area-inset-bottom)] sm:px-8 lg:px-12">
      <div className="grid h-18 grid-cols-3 items-center gap-2">
        <Link href="/" aria-current={pathname === "/" ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-[#791a30] ${pathname === "/" ? "text-[#791a30]" : "text-[#293446]"}`}><HomeIcon size={23} aria-hidden="true" />Inicio</Link>
        <Link href="/movimientos" aria-current={pathname.startsWith("/movimientos") ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-0.5 text-xs font-medium focus-visible:outline-2 focus-visible:outline-[#791a30] ${pathname.startsWith("/movimientos") ? "text-[#791a30]" : "text-[#293446]"}`}><DocumentIcon size={23} aria-hidden="true" />Movimientos</Link>
        <button type="button" onClick={onSignOut} disabled={leaving} className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-xs text-[#293446] focus-visible:outline-2 focus-visible:outline-[#791a30] disabled:opacity-50"><LogoutIcon size={23} aria-hidden="true" />{leaving ? "Saliendo…" : "Salir"}</button>
      </div>
    </nav>
  );
}
