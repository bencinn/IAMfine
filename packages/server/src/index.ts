import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(
    cors({
      origin: "*",
    }),
  )
  .get("/", () => "Hello Elysia")
  .get("/jwks", async () => await Bun.file("./public-key.json").json())
  .listen(3001);

console.log(`🚀 Server running at http://localhost:3001`);

export type App = typeof app;
