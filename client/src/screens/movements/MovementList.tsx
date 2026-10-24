import type { Movement } from "../../generated/types.gen";
import MovementRow from "../../shared/components/MovementRow";

export default function MovementList({ movements, filtered }: { movements: Movement[]; filtered: boolean }) {
  return (
    <section aria-label="Historial de movimientos">
      {movements.length === 0 ? (
        <p className="rounded-[20px] bg-white p-8 text-[#617083]">{filtered ? "No encontramos movimientos con esos filtros." : "Todavía no tenés movimientos."}</p>
      ) : (
        <ul className="space-y-3">
          {movements.map((movement) => <MovementRow key={movement.id} movement={movement} />)}
        </ul>
      )}
    </section>
  );
}
