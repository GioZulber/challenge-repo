import Link from "next/link";
import { MagnifierIcon } from "@solar-icons/react/broken/magnifier";
import type { Movement } from "../../generated/types.gen";
import MovementRow from "../../shared/components/MovementRow";

export default function RecentMovements({ movements }: { movements: Movement[] }) {
  return (
    <section aria-labelledby="movements-title">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id="movements-title" className="text-xl font-semibold sm:text-2xl">Últimos movimientos</h2>
      </div>
      {movements.length === 0 ? (
        <div className="rounded-[20px] bg-white p-8 text-[#617083]">Todavía no tenés movimientos.</div>
      ) : (
        <ul className="space-y-3">
          {movements.slice(0, 4).map((movement) => <MovementRow key={movement.id} movement={movement} />)}
        </ul>
      )}
    </section>
  );
}
