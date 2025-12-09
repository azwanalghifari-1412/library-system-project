import { Router } from "express";
import authRouter from "./authRoute.js"; // Import route Auth

const router = Router();

// Rute dasar untuk /api
router.get("/", (req, res) => {
  res.json({ message: "API root OK" });
});

// Daftarkan route Auth
// Semua endpoint di authRoute.js akan diawali /api/auth
router.use("/auth", authRouter);

// Di sini nanti didaftarkan Books, Users, dll.

export default router;