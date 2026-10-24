-- Card display metadata only; never store a full card number.
ALTER TABLE "User"
    ADD COLUMN "cardBrand" TEXT,
    ADD COLUMN "cardLast4" TEXT,
    ADD COLUMN "cardExpires" TEXT;
