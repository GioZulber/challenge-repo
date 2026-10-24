import Link from "next/link";
import { MagnifierIcon } from "@solar-icons/react/broken/magnifier";
import { BellIcon } from "@solar-icons/react/broken/bell";

export default function HomeGreeting({ name }: { name: string }) {
  return (
    <div className="mb-7 flex items-center justify-between gap-3 sm:mb-10">
      <div className="min-w-0">
        <p className="text-sm text-[#617083]">Hola</p>
        <h1 className="break-words text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[#251934] sm:gap-4">
        <Link href="/movimientos" aria-label="Buscar movimientos" className="grid size-11 place-items-center rounded-lg focus-visible:outline-2 focus-visible:outline-[#791a30]"><MagnifierIcon size={27} aria-hidden="true" /></Link>
        <span role="img" aria-label="Notificaciones, próximamente" title="Notificaciones, próximamente" className="grid size-11 place-items-center"><BellIcon size={27} aria-hidden="true" /></span>
      </div>
    </div>
  );
}
