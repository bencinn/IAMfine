import { Elysia } from "elysia";
import z from "zod";
import db from "./db";
import * as schema from "./db/schema";
import { eq, and, arrayContains } from "drizzle-orm";

import { verifySesh } from "./authn";

const oidc = new Elysia()
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
    async ({ cookie: { sesh_id, cur_ident }, query, request }) => {
      const queryScope = query.scope.split(" ");
      if (!queryScope.includes("openid")) {
        console.log("request doesn't contain 'openid' scope, continuing");
      }

      // should be valid request. we will try to login and create authorization code
      const sesh = await verifySesh(sesh_id.value);
      if (sesh == null) return Response.redirect("http://localhost:3000/login");
      if (cur_ident.value === undefined) {
        let newUrl = new URL("http://localhost:3000/select");
        new URL(request.url).searchParams.forEach((v, e) => {
          newUrl.searchParams.set(v, e);
        });
        return Response.redirect(newUrl);
      }

      const ident_info = await db
        .select()
        .from(schema.users_ident)
        .where(
          and(
            eq(schema.users_ident.id, cur_ident.value as string),
            arrayContains(schema.users_ident.client_id, [query.client_id]),
          ),
        );

      const r = ident_info[0];
      const code = await db.insert(schema.authz).values({ ident_id: r.id }).returning();

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
  );

export default oidc;
