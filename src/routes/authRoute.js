import { Router } from "express";
import validate from "../middleware/validationMiddleware.js";
import { registerSchema } from "../validators/authValidator.js";
import authController from "../controllers/authController.js";

const router = Router();

// Endpoint: POST /api/auth/register
router.post("/register", 
    validate(registerSchema), 
    authController.register 
);

// Di sini nanti ada /login, /refresh, /me, dll.

export default router;