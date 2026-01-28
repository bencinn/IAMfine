import type { App } from "@yuru/server";
import { treaty } from "@elysiajs/eden";

const getTreaty = treaty<App>("localhost:3001");
export default getTreaty;
