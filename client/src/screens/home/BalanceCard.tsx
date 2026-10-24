import Image from "next/image";
import type { BalanceResponse } from "../../generated/types.gen";
import { money } from "../../shared/money";

export default function BalanceCard({ balance, name }: { balance: BalanceResponse; name: string }) {
  return (
    <section aria-labelledby="balance-title">
      <h2 id="balance-title" className="sr-only">Saldo disponible</h2>
      <div className="flex min-h-60 flex-col justify-between gap-6 rounded-[20px] bg-[#791a30] p-5 text-white sm:min-h-80 sm:p-8 md:min-h-92 lg:min-h-72">
        <div>
          <div className="flex items-start justify-between gap-3">
            <p className="text-lg sm:text-xl">Balance</p>
            {balance.card && <Image src={balance.card.brand === "MASTERCARD" ? "/mastercard.svg" : "/icons8-visa%201.svg"} alt={balance.card.brand === "MASTERCARD" ? "Mastercard" : "Visa"} width={42} height={30} className="h-8 w-auto" />}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="rounded-lg bg-[linear-gradient(135deg,#f2bd43,#eedbfa)] px-3 py-1.5 text-base font-medium text-[#522025] sm:text-lg">USD</span>
            <p className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">{money.format(balance.balanceCents / 100).replace("$", "")}</p>
          </div>
        </div>
        {balance.card && <p aria-label={`Tarjeta terminada en ${balance.card.last4}`} className="whitespace-nowrap text-lg tracking-widest tabular-nums sm:text-2xl"><span aria-hidden="true">**** **** **** {balance.card.last4}</span></p>}
        <div className="flex items-end justify-between gap-3">
          <span className="min-w-0 truncate text-lg sm:text-2xl">Soy {name}</span>
          {balance.card && <span className="shrink-0 text-right text-xs leading-tight sm:text-sm">Exp. Date<br /><span className="text-base tabular-nums sm:text-lg">{balance.card.expires}</span></span>}
        </div>
      </div>
    </section>
  );
}
