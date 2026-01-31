import { createFileRoute } from "@tanstack/react-router";
// import { treaty } from "@elysiajs/eden";
// import type { App } from "@yuru/server";
// import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

// const getTreaty = treaty<App>("localhost:3001");

function RouteComponent() {
  return <div></div>;
}
