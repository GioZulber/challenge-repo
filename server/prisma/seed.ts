import "dotenv/config";
import { prisma } from "../src/db/db.js";
import { MovementType } from "../src/generated/prisma/enums.js";
import { hashPassword, verifyPassword } from "../src/features/auth/password.js";

async function main() {
  const email = process.env.DEMO_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error("Set DEMO_EMAIL and DEMO_PASSWORD (at least 8 characters) before seeding");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && !verifyPassword(password, existing.passwordHash)) {
    throw new Error("An account with DEMO_EMAIL already exists with another password");
  }

  const user = existing ?? (await prisma.user.create({
    data: {
      name: "Granate",
      email,
      passwordHash: hashPassword(password),
      balanceCents: 97885,
      cardBrand: "MASTERCARD",
      cardLast4: "1234",
      cardExpires: "02/30",
    },
  }));

  if (existing) {
    await prisma.user.update({
      where: { id: user.id },
      data: { cardBrand: "MASTERCARD", cardLast4: "1234", cardExpires: "02/30" },
    });
  }

  await prisma.movement.createMany({
    skipDuplicates: true,
    data: [
      { id: "adobe", counterparty: "Adobe", description: "Pago de suscripción", amountCents: 12500, type: MovementType.DEBIT_AUTO, createdAt: new Date("2026-10-19T13:00:00Z") },
      { id: "ronaldo", counterparty: "Ronaldo", description: "Pago recibido", amountCents: 9500, type: MovementType.RECEIVED, createdAt: new Date("2026-10-18T12:00:00Z") },
      { id: "figma", counterparty: "Figma", description: "Pago de suscripción", amountCents: 12500, type: MovementType.DEBIT_AUTO, createdAt: new Date("2026-10-17T16:00:00Z") },
      { id: "juan", counterparty: "Juan Pérez", description: "Pago enviado", amountCents: 9500, type: MovementType.SENT, createdAt: new Date("2026-10-16T15:00:00Z") },
      { id: "jose", counterparty: "José Suárez", description: "Pago recibido", amountCents: 9500, type: MovementType.RECEIVED, createdAt: new Date("2026-10-15T13:00:00Z") },
      { id: "julio", counterparty: "Julio César", description: "Pago recibido", amountCents: 9500, type: MovementType.RECEIVED, createdAt: new Date("2026-10-14T10:00:00Z") },
    ].map((movement) => ({ ...movement, id: `${user.id}-${movement.id}`, userId: user.id })),
  });

  console.log("Demo account and movements are ready");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
