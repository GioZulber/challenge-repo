import type { Movement } from "../../generated/types.gen";
import { money } from "../../shared/money";

const types: Record<Movement["type"], string> = {
  RECEIVED: "Recibido",
  SENT: "Enviado",
  DEBIT_AUTO: "Débito automático",
};

const date = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

export default function MovementDetailCard({ movement }: { movement: Movement }) {
  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-2 lg:gap-8">
      <section aria-label="Importe del movimiento" className="flex min-h-60 flex-col rounded-[20px] bg-[#791a30] p-6 text-white sm:p-8">
        <p className="text-lg">{types[movement.type]}</p>
        <div className="my-auto text-center">
          <p className="break-words text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">{movement.type === "RECEIVED" ? "+" : "−"}{money.format(Math.abs(movement.amountCents) / 100)}</p>
          <p className="mt-2 text-sm text-[#f3d9de]">USD</p>
        </div>
      </section>
      <section aria-label="Datos del movimiento" className="rounded-[20px] bg-white p-6 sm:p-8">
        <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-x-3 gap-y-6 text-sm sm:text-base">
          <dt className="text-[#617083]">Contraparte</dt><dd className="min-w-0 break-words font-medium">{movement.counterparty}</dd>
          <dt className="text-[#617083]">Descripción</dt><dd className="min-w-0 break-words font-medium">{movement.description}</dd>
          <dt className="text-[#617083]">Fecha</dt><dd className="font-medium tabular-nums">{date.format(new Date(movement.createdAt))}</dd>
          <dt className="text-[#617083]">Tipo</dt><dd className="font-medium">{types[movement.type]}</dd>
        </dl>
      </section>
    </div>
  );
}
