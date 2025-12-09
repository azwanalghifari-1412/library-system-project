// src/routes/authRoute.js (Koreksi)

import { Router } from "express";
import validate from "../middleware/validationMiddleware.js";
// 🎯 KOREKSI: Tambahkan loginSchema ke dalam import list
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
    validate(loginSchema), // Sekarang loginSchema sudah terdefinisi
    authController.login 
);

// Di sini nanti ada, /refresh, /me, dll.

export default router;