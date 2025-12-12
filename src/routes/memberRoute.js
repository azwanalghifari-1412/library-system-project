import { Router } from "express";
import memberController from "../controllers/memberController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js"; 

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

router.get("/", memberController.getAllMembers); 

router.get("/:id", memberController.getMemberById); 

router.post("/", memberController.createMember); 

router.put("/:id", memberController.updateMember);

router.delete("/:id", memberController.deleteMember);

export default router;