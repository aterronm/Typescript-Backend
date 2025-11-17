// src/mongo.ts
import { Db, MongoClient, ServerApiVersion } from "mongodb";

let client: MongoClient;
let dB: Db;
const dbName = "Tienda";

export const connectMongoDB = async (): Promise<void> => {
  if (dB) return; // ya conectados
  try {
    const uri =
      process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0
        ? process.env.MONGODB_URI
        : (() => {
            const user = encodeURIComponent(process.env.USER_MONGO || "");
            const pass = encodeURIComponent(process.env.USER_PASSWORD || "");
            const cluster = process.env.MONGO_CLUSTER || ""; // ej: aterrónm.sa30qim.mongodb.net
            const app = encodeURIComponent(process.env.MONGO_APP_NAME || "app");
            if (!user || !pass || !cluster) {
              throw new Error("Faltan USER_MONGO/USER_PASSWORD/MONGO_CLUSTER o MONGODB_URI");
            }
            // sin ".3ta2r.mongodb.net" hardcodeado, ME SALE CONTINUAMENTE ERROR 
            return `mongodb+srv://${user}:${pass}@${cluster}/?retryWrites=true&w=majority&appName=${app}`;
          })();

    client = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });

    await client.connect();
    dB = client.db(process.env.MONGO_DB_NAME || dbName);
    await dB.admin().command({ ping: 1 });
    console.log("Connected to mongodb at db " + dB.databaseName);
  } catch (error) {
    console.log("Error mongo: ", error);
    throw error; 
  }
};

export const getDb = (): Db => {
  if (!dB) throw new Error("DB no inicializada. Llama a connectMongoDB() primero.");
  return dB;
};
