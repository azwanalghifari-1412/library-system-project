// src/server.js (Baru)

// Import dotenv di paling atas untuk memuat variabel lingkungan
import 'dotenv/config'; 
import app from "./app.js"; 
import prisma from "./config/prisma.js"; // Dipakai untuk test-db

// Ambil PORT dari .env atau default ke 3000
const PORT = process.env.PORT || 3000; 

// 🎯 Endpoint Test Database Connection (Dipindahkan ke sini atau ke route)
// Kita pertahankan di sini untuk sementara agar app.js bersih.
app.get("/test-db", async (req, res) => {
  try {
    // Jalankan query sederhana
    await prisma.$queryRaw`SELECT 1`; 
    res.json({ message: "Database connection OK" });
  } catch (err) {
    console.error("Database connection error:", err);
    // Beri response error
    res.status(500).json({ error: "Database error or connection failed" });
  }
});

// Mulai server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});