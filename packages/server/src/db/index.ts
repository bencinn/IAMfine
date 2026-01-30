import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
const db = drizzle(process.env.DATABASE_URL);

await migrate(db, { migrationsFolder: "drizzle" });
export default db;
