// IAMfine authorization server

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

import oidc from "./oidc";
import admin from "./admin";
import authn from "./authn";

const app = new Elysia()
  .use(
    cors({
      origin: "*",
    }),
  )
  .get("/", () => "IAMfine server is running")
  .use(oidc)
  .use(admin)
  .use(authn)
  .listen(3001);

console.log(`🚀 Server running at http://localhost:3001`);

export type App = typeof app;
