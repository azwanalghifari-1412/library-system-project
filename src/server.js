// src/server.js (Perbaikan)

import 'dotenv/config'; 
import app from "./app.js"; 
import prisma from "./config/prisma.js"; 


const PORT = process.env.PORT || 3000; 


// 🎯 TAMBAHAN: Route Health Check Utama
app.get("/", (req, res) => {
  // Ini adalah respons untuk http://localhost:3000/
  res.send("Library Management API is running..."); 
});


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