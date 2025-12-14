// src/routes/authRoute.js

import { Router } from "express";
import validate from "../middleware/validationMiddleware.js"; 
import { authenticate } from "../middleware/authMiddleware.js";
import authController from "../controllers/authController.js";

import { 
    registerValidator, 
    loginValidator,
    refreshTokenValidator 
} from "../validators/authValidator.js"; 

const router = Router();

// 1. Endpoint: POST /api/auth/register
router.post(
    "/register", 
    validate(registerValidator), 
    authController.register 
);

// 2. Endpoint: POST /api/auth/login
router.post(
    "/login", 
    validate(loginValidator), 
    authController.login 
);

// 3. Endpoint: POST /api/auth/refresh-token
router.post(
    "/refresh-token",
    validate(refreshTokenValidator), 
    authController.handleRefreshToken 
);

// 4. Endpoint: GET /api/auth/me (Membutuhkan Access Token)
router.get(
    "/me", 
    authenticate, 
    authController.getMe 
);

export default router;