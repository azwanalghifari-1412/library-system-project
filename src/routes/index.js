import { Router } from "express";
import authRouter from "./authRoute.js";
import userRouter from "./userRoute.js"; 
import bookRouter from "./bookRoute.js";
import tagRouter from "./tagRoute.js";
import memberRouter from "./memberRoute.js"
import loanRouter from "./loanRoute.js"

const router = Router();

// Rute dasar untuk /api
router.get("/", (req, res) => {
  res.json({ message: "API root OK" });
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/books", bookRouter);
router.use("/tags", tagRouter);
router.use("/members", memberRouter);
router.use("/loans", loanRouter);

export default router;