import Link from "next/link";
import BrandHeader from "../../../shared/components/BrandHeader";

export default function MovementNotFound() {
  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 pt-7 sm:px-8 sm:pt-12 lg:px-12">
      <BrandHeader />
      <section className="mx-auto max-w-md rounded-[20px] bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold">Movimiento no encontrado</h1>
        <p className="mt-3 text-[#617083]">No pudimos encontrar ese movimiento.</p>
        <Link href="/movimientos" className="mt-7 inline-block rounded-lg bg-[#791a30] px-6 py-3 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#791a30]">Volver a movimientos</Link>
      </section>
    </main>
  );
}
