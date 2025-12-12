import { Router } from "express";
import loanController from "../controllers/loanController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js"; 
import validate from "../middleware/validationMiddleware.js";
import loanValidator from "../validators/loanValidator.js";

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

router.get("/", loanController.getAllLoans); 

router.post("/", validate(loanValidator.loanSchema), loanController.borrowBook); 

router.put("/:id/return", loanController.returnBook);

export default router;