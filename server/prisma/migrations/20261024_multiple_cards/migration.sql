CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expires" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Card_userId_idx" ON "Card"("userId");
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Do not discard partially filled card metadata from existing accounts.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM "User"
    WHERE ("cardBrand" IS NOT NULL OR "cardLast4" IS NOT NULL OR "cardExpires" IS NOT NULL)
      AND ("cardBrand" IS NULL OR "cardLast4" IS NULL OR "cardExpires" IS NULL)
  ) THEN
    RAISE EXCEPTION 'Cannot migrate users with incomplete card metadata';
  END IF;
END $$;

INSERT INTO "Card" ("id", "userId", "brand", "last4", "expires", "createdAt")
SELECT "id" || '-primary-card', "id", "cardBrand", "cardLast4", "cardExpires", "createdAt"
FROM "User"
WHERE "cardBrand" IS NOT NULL;

ALTER TABLE "User"
    DROP COLUMN "cardBrand",
    DROP COLUMN "cardLast4",
    DROP COLUMN "cardExpires";
