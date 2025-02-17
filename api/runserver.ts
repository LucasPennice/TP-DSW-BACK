import { port } from "./constants.js";
import { startServer } from "./index.js";
import { initORM } from "./orm.js";

const { em } = await initORM();

await startServer(port, em);
