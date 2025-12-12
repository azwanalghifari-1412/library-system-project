import { Router } from "express";
import userController from "../controllers/userController.js";
import validate from "../middleware/validationMiddleware.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js"; 
import userValidator from "../validators/userValidator.js";

const router = Router();

router.get("/", 
    authenticate, 
    authorize(['ADMIN']), 
    userController.getAllUsers
);

router.get("/:id", 
    authenticate, 
    userController.getUserById
);

router.put("/:id", 
    authenticate, 
    // 🎯 MIDDLEWARE OTORISASI KUSTOM (Logic Check)
    (req, res, next) => {
        const targetUserId = parseInt(req.params.id);
        
        // Cek 1: Apakah pengguna yang login adalah ADMIN?
        if (req.user.role === 'ADMIN') {
            return next();
        }
        
        // Cek 2: Apakah pengguna yang login mencoba mengedit datanya sendiri?
        if (req.user.id === targetUserId) {
            return next();
        }
        
        // Jika tidak memenuhi kedua kondisi, tolak akses
        return res.status(403).json({ 
            success: false, 
            message: "Forbidden: You do not have permission to modify this user's data." 
        });
    },
    // 🎯 MIDDLEWARE VALIDASI INPUT
    validate(userValidator.userUpdateSchema), 
    userController.updateUser
);

router.delete("/:id", 
    authenticate, 
    authorize(['ADMIN']), 
    userController.deleteUser
);

export default router;