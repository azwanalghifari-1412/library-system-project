import { Router } from "express";
import userController from "../controllers/userController.js";
// Import middleware otentikasi dan otorisasi
import { authenticate, authorize } from "../middleware/authMiddleware.js"; 

const router = Router();

// Endpoint: GET /api/users (List semua pengguna)
// Proteksi: Wajib Login (authenticate) DAN Wajib Role ADMIN (authorize(['ADMIN']))
router.get("/", 
    authenticate, 
    authorize(['ADMIN']), 
    userController.getAllUsers
);

// Endpoint: GET /api/users/:id (Lihat detail pengguna)
// Proteksi: Wajib Login (authenticate).
// Cek Otorisasi (hanya bisa lihat diri sendiri atau ADMIN) dilakukan di dalam Controller.
router.get("/:id", 
    authenticate, 
    userController.getUserById
);

// Nanti akan ada: POST, PUT, DELETE /api/users...

export default router;