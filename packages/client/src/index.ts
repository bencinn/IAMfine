import { serve } from "bun";
import index from "./index.html";
import api from "./api";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
    "/.well-known/jwks.json": async () => {
      const r = await api.jwks.get();
      if (!r.error) {
        let key = r.data as Record<string, string>;
        key["use"] = "sig";
        key["alg"] = "RS256";
        key["kid"] = "default";

        const res = {keys: [key]};
        return Response.json(res);
      }
      else {
        return new Response("Error fetching JWKS", { status: 500 });
      }
    }
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
  port: 3002,
});

console.log(`🚀 Server running at ${server.url}`);
