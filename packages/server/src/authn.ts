import { Elysia } from "elysia";
import { z } from "zod";

import db from "./db";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

// TODO: improve this
export async function verifySesh(sesh_id: unknown | undefined) {
  if (sesh_id === undefined) return null;
  const r = await db
    .select()
    .from(schema.sesh)
    .where(eq(schema.sesh.id, sesh_id as string));
  if (r.length == 0) return null;
  return r[0];
}

async function allocateSesh(username: string, password: string) {
  const r = await db.select().from(schema.users).where(eq(schema.users.username, username));
  if (r[0] === undefined) return null;

  // verify password
  if (!(await Bun.password.verify(password, r[0].password_hash))) return null;

  // create sesh
  const result = await db
    .insert(schema.sesh)
    .values({
      userid: r[0].id,
    })
    .returning();
  return result[0].id;
}

const authn = new Elysia()
  .post(
    "/login",
    async ({ cookie: { sesh_id }, body }) => {
      if (await verifySesh(sesh_id.value)) return Response.redirect(body.redirect_uri);

      const x = await allocateSesh(body.username, body.password);
      if (x !== null) {
        sesh_id.value = x;
        return Response.redirect(body.redirect_uri);
      }
      return new Response("Incorrect credentials, please try again.", { status: 401 });
    },
    {
      body: z.object({
        redirect_uri: z.url().default("http://localhost:3001"),
        username: z.string(),
        password: z.string(),
      }),
    },
  )
  .get("/idents", async ({ cookie: { sesh_id } }) => {
    const r = await verifySesh(sesh_id.value);
    if (!r) return null;

    const idents = await db
      .select()
      .from(schema.users_ident)
      .where(eq(schema.users_ident.owner, r.userid));
    return idents;
  });

export default authn;
