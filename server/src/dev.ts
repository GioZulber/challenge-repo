import { prisma } from "./db/db.js";
import { createApp } from "./index.js";

if (process.env.NODE_ENV === "production" && !process.env.CLIENT_ORIGIN) {
  throw new Error("CLIENT_ORIGIN is required in production");
}

createApp(prisma).listen(Number(process.env.PORT ?? 3001), () => {
  console.log(`API running on http://localhost:${process.env.PORT ?? 3001}`);
});
