import { Router } from "express";
import authRouter from "./authRoute.js";
import userRouter from "./userRoute.js"; 
import bookRouter from "./bookRoute.js";

const router = Router();

// Rute dasar untuk /api
router.get("/", (req, res) => {
  res.json({ message: "API root OK" });
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/books", bookRouter);
// Di sini nanti didaftarkan Users, dll.

export default router;