import express from "express";
import cors from "cors"; // Wajib ditambahkan untuk middleware

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Untuk parsing JSON body


import router from "./routes/index.js";
app.use("/api", router);

// Export aplikasi (WAJIB untuk diimport oleh server.js)
export default app;