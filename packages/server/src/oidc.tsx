import { Elysia } from "elysia";
import { html, Html } from "@elysiajs/html";
import z from "zod";
import db from "./db";
import * as schema from "./db/schema";
import { eq, and, or, arrayContains, isNull } from "drizzle-orm";

import { verifySesh } from "./authn";

const oidc = new Elysia()
  .use(html())
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
    async ({ cookie: { sesh_id }, query }) => {
      const queryScope = query.scope.split(" ");
      if (!queryScope.includes("openid")) {
        console.log("request doesn't contain 'openid' scope, continuing");
      }

      // should be valid request.

      const sesh = await verifySesh(sesh_id.value);

      if (sesh == null) {
        return (
          <html>
            You have not logged in yet, please do so at
            <a onclick="return window.open('http://oidc.chimamema.me/login');">
              http://oidc.chimamema.me/login
            </a>
            and then refresh this page.
          </html>
        );
      }

      // let's first check if old authz exist for this client_id
      const authz_found = await db
        .select({ authz: schema.authz })
        .from(schema.authz)
        .innerJoin(schema.users_ident, and(eq(schema.authz.ident_id, schema.users_ident.id)))
        .where(
          and(
            eq(schema.users_ident.owner, sesh.userid),
            or(
              arrayContains(schema.users_ident.permit_client_id, [query.client_id]),
              isNull(schema.users_ident.permit_client_id),
            ),
          ),
        );

      if (query.cur_ident === undefined) {
        if (authz_found[0] !== undefined) {
          const r = authz_found[0].authz;

          let url = new URL(query.redirect_uri);
          url.searchParams.append("code", r.id.toString());
          if (query.state) url.searchParams.append("state", query.state);
          return Response.redirect(url.toString(), 302);
        }
        return "You have not set the identity for this session yet, please set another GET query parameter called `cur_ident` with the identity UUID.";
      }

      const ident = await db
        .select()
        .from(schema.users_ident)
        .where(
          and(
            eq(schema.users_ident.id, query.cur_ident),
            eq(schema.users_ident.owner, sesh.userid),
            or(
              arrayContains(schema.users_ident.permit_client_id, [query.client_id]),
              isNull(schema.users_ident.permit_client_id),
            ),
          ),
        );
      if (ident.length == 0)
        return `The identity doesn't exist or its not approved to connect with this client id, please choose other identity`;

      const r = ident[0];
      const code = await db
        .insert(schema.authz)
        .values({ ident_id: r.id, client_id: query.client_id })
        .returning();

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
        cur_ident: z.string().optional(),
      }),
    },
  );

export default oidc;
