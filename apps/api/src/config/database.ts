import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env.js";

let memoryServer: MongoMemoryServer | null = null;
let connectedUri: string | null = null;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  let mongoUri = env.mongodbUri;

  if (!mongoUri) {
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: "karnataka-grocery-mvp"
      }
    });
    mongoUri = memoryServer.getUri();
    connectedUri = mongoUri;
    console.log("Using in-memory MongoDB because MONGODB_URI is not set.");
  }

  await mongoose.connect(mongoUri);
  connectedUri = mongoUri;
  console.log(`MongoDB connected: ${connectedUri}`);

  return mongoose.connection;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export function getDatabaseHealth() {
  return {
    readyState: mongoose.connection.readyState,
    usingInMemory: !env.mongodbUri,
    uri: connectedUri
  };
}
