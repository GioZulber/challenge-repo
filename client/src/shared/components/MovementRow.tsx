import Image from "next/image";
import Link from "next/link";
import type { Movement } from "../../generated/types.gen";
import { money } from "../money";

export default function MovementRow({ movement }: { movement: Movement }) {
  return (
    <li>
      <Link href={`/movimientos/${encodeURIComponent(movement.id)}`} className="flex min-h-20 items-center gap-3 rounded-[20px] bg-white px-4 py-3 transition-colors hover:bg-[#f0e3e6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791a30] sm:gap-4 sm:px-5">
        <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-[12px] ${movement.type === "RECEIVED" ? "bg-[#f0e3e6]" : movement.type === "SENT" ? "bg-[#ffecdc]" : "bg-[#f2e7fb]"}`}>
          <Image src={movement.type === "RECEIVED" ? "/CASH-IN.svg" : movement.type === "SENT" ? "/CASH-OUT.svg" : "/SUS.svg"} alt="" width={movement.type === "DEBIT_AUTO" ? 18 : 16} height={movement.type === "DEBIT_AUTO" ? 20 : 16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{movement.counterparty}</span>
          <span className="block truncate text-sm text-[#788393]">{movement.description}</span>
        </span>
        <span className="shrink-0 text-right font-semibold tabular-nums text-[#293446]">
          {movement.type === "RECEIVED" ? "+" : "−"}{money.format(Math.abs(movement.amountCents) / 100)}
        </span>
      </Link>
    </li>
  );
}
