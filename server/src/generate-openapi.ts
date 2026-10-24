import { writeFileSync } from "node:fs";
import { openapiDocument } from "./openapi.js";

writeFileSync("openapi.json", `${JSON.stringify(openapiDocument, null, 2)}\n`);
