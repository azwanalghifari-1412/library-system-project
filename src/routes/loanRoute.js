import { Router } from "express";
import loanController from "../controllers/loanController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js"; 

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

router.get("/", loanController.getAllLoans); 

router.post("/", loanController.borrowBook); 

router.put("/:id/return", loanController.returnBook);

export default router;