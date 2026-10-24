import { MagnifierIcon } from "@solar-icons/react/broken/magnifier";
import type { Movement } from "../../generated/types.gen";

export type MovementFilter = "ALL" | Movement["type"];

const filters: { label: string; value: MovementFilter }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Recibidos", value: "RECEIVED" },
  { label: "Enviados", value: "SENT" },
  { label: "Débitos automáticos", value: "DEBIT_AUTO" },
];

export default function MovementFilters({ query, onQueryChange, type, onTypeChange }: {
  query: string;
  onQueryChange: (query: string) => void;
  type: MovementFilter;
  onTypeChange: (type: MovementFilter) => void;
}) {
  return (
    <div className="mb-7 space-y-4 sm:mb-9">
      <div className="relative max-w-xl">
        <label htmlFor="movement-search" className="sr-only">Buscar por persona o servicio</label>
        <MagnifierIcon size={22} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#617083]" />
        <input id="movement-search" type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} maxLength={100} placeholder="Buscar por persona o servicio" autoComplete="off" className="w-full rounded-xl bg-white py-3.5 pl-12 pr-4 text-[#293446] outline-none placeholder:text-[#788393] focus-visible:ring-2 focus-visible:ring-[#791a30]" />
      </div>
      <div role="group" aria-label="Filtrar movimientos" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {filters.map((filter) => (
          <button key={filter.value} type="button" aria-pressed={type === filter.value} onClick={() => onTypeChange(filter.value)} className={`min-h-11 rounded-xl px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791a30] ${type === filter.value ? "bg-[#791a30] text-white" : "bg-white text-[#293446] hover:bg-[#f0e3e6]"}`}>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
