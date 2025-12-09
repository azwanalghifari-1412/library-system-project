import express from "express";
import prisma from "./config/prisma.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Library Management API is running...");
});

// test database connection
app.get("/test-db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ message: "Database connection OK" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
