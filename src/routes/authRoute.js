import { Router } from "express";
import validate from "../middleware/validationMiddleware.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js"; 
import authController from "../controllers/authController.js";

const router = Router();

// Endpoint: POST /api/auth/register
router.post("/register", 
    validate(registerSchema), 
    authController.register 
);

// Endpoint: POST /api/auth/login
router.post("/login", 
    validate(loginSchema), 
    authController.login 
);

// Endpoint: GET /api/auth/me (Membutuhkan Otentikasi)
router.get("/me", 
    authenticate, // 🎯 MIDDLEWARE: Memastikan JWT valid
    authController.getMe 
);

// Di sini nanti ada, /refresh, dll.

export default router;