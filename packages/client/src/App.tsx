import "./index.css";

import type { App } from "@yuru/server";
import { useQuery } from "@tanstack/react-query";

import getTreaty from "./api";

export function App() {
  const query = useQuery({ queryKey: ["todos"], queryFn: () => getTreaty.get() });
  return (
    <div className="app">
      <h1>IAMfine</h1>
      <h2>{query.data?.data}</h2>
    </div>
  );
}

export default App;
