import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { ensureSeedData } from "../src/services/seedService.js";

async function run() {
  await connectDatabase();
  await ensureSeedData(true);
  console.log("Seed data refreshed.");
  await disconnectDatabase();
}

run().catch(async (error) => {
  console.error(error);
  await disconnectDatabase();
  process.exit(1);
});
