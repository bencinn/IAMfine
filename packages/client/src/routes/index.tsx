import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import { useQuery } from "@tanstack/react-query";
import type { App as ServerApp } from "@yuru/server";
import { treaty } from "@elysiajs/eden";

export const Route = createFileRoute("/")({
  component: App,
});

const getTreaty = treaty<ServerApp>("localhost:3001");

function App() {
  const query = useQuery({ queryKey: ["todos"], queryFn: () => getTreaty.get() });
  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <img
          src={logo}
          className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <a
          className="text-[#61dafb] hover:underline"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className="text-[#61dafb] hover:underline"
          href="https://tanstack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn TanStack
        </a>
        <p>Status: {query.isLoading ? "loading" : "done"}</p>
        <p>Data: {query.data?.data ?? "N/A"}</p>
      </header>
    </div>
  );
}
