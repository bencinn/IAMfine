import { Elysia } from "elysia";
import z from "zod";
import db from "./db";
import * as schema from "./db/schema";

const admin = new Elysia().post(
  "/admin/createUser",
  async ({ body }) => {
    if (await Bun.password.verify(body.admin_pass, atob(process.env.SERV_PASSWORD_HASH))) {
      await db.insert(schema.users).values({
        username: body.username,
        password_hash: await Bun.password.hash(body.password),
        is_admin: body.is_admin,
      });
      return new Response("Success", { status: 201 });
    }
    return new Response("Unauthorized", { status: 401 });
  },
  {
    body: z.object({
      username: z.string(),
      password: z.string(),
      is_admin: z.coerce.boolean().default(false),
      admin_pass: z.string(),
    }),
  },
);

export default admin;
