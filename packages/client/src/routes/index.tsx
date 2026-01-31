import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import { useQuery } from "@tanstack/react-query";
import type { App } from "@yuru/server";
import { treaty } from "@elysiajs/eden";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const getTreaty = treaty<App>("localhost:3001");

function RouteComponent() {
  const query = useQuery({ queryKey: ["todos"], queryFn: () => getTreaty.get() });
  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <img
          src={logo}
          className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        <p>IAMfine front running</p>
        <p>Pinging server: {query.isLoading ? "loading" : "done"}</p>
        <p>Data: {query.data?.data ?? "N/A"}</p>
      </header>
    </div>
  );
}
