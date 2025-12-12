import { Router } from "express";
import memberController from "../controllers/memberController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";
import memberValidator from "../validators/memberValidator.js";

const router = Router();

router.use(authenticate, authorize(['ADMIN']));

router.get("/", memberController.getAllMembers); 

router.get("/:id", memberController.getMemberById); 

router.post("/", validate(memberValidator.memberSchema), memberController.createMember);

router.put("/:id", validate(memberValidator.memberSchema), memberController.updateMember);

router.delete("/:id", memberController.deleteMember);

export default router;