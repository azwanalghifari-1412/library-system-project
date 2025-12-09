// src/app.js (Perbaikan)

import express from "express";
import cors from "cors"; // Wajib ditambahkan untuk middleware

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Untuk parsing JSON body

// 👉 Routing Utama
// Kita asumsikan router utama sudah dibuat di src/routes/index.js
import router from "./routes/index.js";
app.use("/api", router);

// Catatan: Health check '/' dan '/test-db' seharusnya ada di server.js
// Namun, karena belum ada error handler, kita biarkan saja di sini untuk memudahkan import

// ⚠️ Health check dan test DB dipindahkan ke server.js/index.js, 
// tetapi kita buatkan rute dasar di sini yang akan ditimpa di server.js/index.js
// (Opsional, lebih baik dihapus jika index.js sudah ada)
// app.get("/", (req, res) => {
//   res.send("Library Management API is running...");
// });

// Export aplikasi (WAJIB untuk diimport oleh server.js)
export default app;