import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../server/openapi.json",
  output: "src/generated",
  plugins: [
    { name: "@hey-api/client-fetch", runtimeConfigPath: "./src/lib/hey-api.ts" },
    { name: "@hey-api/sdk", validator: { response: "zod" } },
  ],
});
