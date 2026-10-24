import Image from "next/image";
import type { BalanceResponse } from "../../generated/types.gen";
import { money } from "../../shared/money";

export default function BalanceCard({ balanceCents, card, name }: { balanceCents: number; card: BalanceResponse["cards"][number] | null; name: string }) {
  return (
    <div className={`flex min-h-52 flex-col justify-between gap-4 rounded-[20px] p-5 sm:min-h-80 sm:gap-6 sm:p-8 md:min-h-92 lg:min-h-72 ${card?.brand === "VISA" ? "bg-[#f8b6bb] text-[#293446]" : "bg-[#791a30] text-white"}`}>
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg sm:text-xl">Balance</p>
          {card && <Image src={card.brand === "MASTERCARD" ? "/mastercard.svg" : "/icons8-visa%201.svg"} alt={card.brand === "MASTERCARD" ? "Mastercard" : "Visa"} width={42} height={30} className="h-8 w-auto" />}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="rounded-lg bg-[linear-gradient(135deg,#f2bd43,#eedbfa)] px-3 py-1.5 text-base font-medium text-[#522025] sm:text-lg">USD</span>
          <p className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">{money.format(balanceCents / 100).replace("$", "")}</p>
        </div>
      </div>
      {card && <p aria-label={`Tarjeta terminada en ${card.last4}`} className="whitespace-nowrap text-[clamp(0.875rem,4vw,1.5rem)] tracking-wider tabular-nums sm:text-2xl"><span aria-hidden="true">**** **** **** {card.last4}</span></p>}
      <div className="flex items-end justify-between gap-3">
        <span className="min-w-0 truncate text-lg sm:text-2xl">Soy {name}</span>
        {card && <span className="shrink-0 text-right text-xs leading-tight sm:text-sm">Exp. Date<br /><span className="text-base tabular-nums sm:text-lg">{card.expires}</span></span>}
      </div>
    </div>
  );
}
