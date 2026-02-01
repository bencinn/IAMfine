import { createFileRoute } from "@tanstack/react-router";
import { treaty } from "@elysiajs/eden";
import type { App } from "@yuru/server";

const getTreaty = treaty<App>("oidc.chimamema.me");

export const Route = createFileRoute("/select/$clientid")({
  component: RouteComponent,
  loader: async ({ route }) => {
    const idents = await getTreaty.idents.get();
    if (idents.data === null) route.redirect({ to: "/login" });
    window.console.log("data:", idents.data);
    window.console.log("error:", idents.error);
    return idents.data;
  },
});

function RouteComponent() {
  const loaderdata = Route.useLoaderData();
  return <div>{JSON.stringify(loaderdata)}</div>;
}
