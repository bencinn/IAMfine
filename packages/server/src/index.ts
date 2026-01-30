import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia()
  .use(
    cors({
      origin: "*",
    }),
  )
  .get("/", () => "IAMfine server is running")
  .get("/.well-known/jwks.json", async () => {
    const r = await Bun.file("./public-key.json").json();
    if (!r.error) {
      let key = r as Record<string, string>;
      key["use"] = "sig";
      key["alg"] = "RS256";
      key["kid"] = "default";

      const res = { keys: [key] };
      return Response.json(res);
    } else {
      return new Response("Error fetching JWKS", { status: 500 });
    }
  })
  .listen(3001);

console.log(`🚀 Server running at http://localhost:3001`);

export type App = typeof app;
