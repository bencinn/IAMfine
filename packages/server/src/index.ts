// IAMfine authorization server
// Implements the core part.

import { Elysia } from "elysia";
import { z } from "zod";
import { cors } from "@elysiajs/cors";

import db from "./db";
import * as schema from "./db/schema";

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
  // https://openid.net/specs/openid-connect-core-1_0.html#AuthorizationEndpoint
  // TODO: implement invalid request.
  .get(
    "/authorize",
    async ({ query }) => {
      const queryScope = query.scope.split(" ");
      if (!queryScope.includes("openid")) {
        console.log("request doesn't contain 'openid' scope, continuing");
      }

      // should be valid request. we will create authorization code
      // TODO: verify authentication by redirecting to auth client

      const code = await db.insert(schema.authz).values({}).returning();

      let url = new URL(query.redirect_uri);
      url.searchParams.append("code", code[0].id.toString());
      if (query.state) url.searchParams.append("state", query.state);
      return Response.redirect(url.toString(), 302);
    },
    {
      query: z.object({
        scope: z.string(), // the parsing should be done outside of type since it is complicated
        response_type: z.literal("code"),
        client_id: z.string(),
        redirect_uri: z.url(),
        state: z.string().optional(), // not here i think
      }),
    },
  )
  .listen(3001);

console.log(`🚀 Server running at http://localhost:3001`);

export type App = typeof app;
