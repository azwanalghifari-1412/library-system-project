import { Router } from "express";
import userController from "../controllers/userController.js";
// Import middleware otentikasi dan otorisasi
import { authenticate, authorize } from "../middleware/authMiddleware.js"; 

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
    userController.updateUser
);

router.delete("/:id", 
    authenticate, 
    authorize(['ADMIN']), 
    userController.deleteUser
);

export default router;