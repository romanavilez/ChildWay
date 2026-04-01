import { ConnectDB } from "../lib/db.js";
import { createTables } from "./createTables.js";

await ConnectDB();
await createTables();