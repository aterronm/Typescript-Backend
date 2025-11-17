// src/server.ts
import "dotenv/config";
import app from "./app"
import { connectMongoDB } from "./config/db"; // o "./config/db" si ese es tu path

const PORT = Number(process.env.PORT || 3000);

(async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`API escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error al conectar a MongoDB", err);
    process.exit(1);
  }
})();
