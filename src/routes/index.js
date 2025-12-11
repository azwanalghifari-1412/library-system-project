import { Router } from "express";
import authRouter from "./authRoute.js";
import userRouter from "./userRoute.js"; 

const router = Router();

// Rute dasar untuk /api
router.get("/", (req, res) => {
  res.json({ message: "API root OK" });
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
// Di sini nanti didaftarkan Books, Users, dll.

export default router;