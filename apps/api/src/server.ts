import  app  from "./app.js";
import { connectCache, disconnectCache } from "./config/cache.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureSeedData } from "./services/seedService.js";

async function start() {
  await connectDatabase();
  await connectCache();
  await ensureSeedData();

  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port}`);
  });
}

async function shutdown() {
  await disconnectCache();
  await disconnectDatabase();
}

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0));
});

process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0));
});

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
