import { Router } from "express";
import tagController from "../controllers/tagController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js"; 

const router = Router();

router.get("/", tagController.getAllTags); 

router.get("/:id", tagController.getTagById); 

router.post("/", 
    authenticate, 
    authorize(['ADMIN']),
    tagController.createTag
); 

router.put("/:id", 
    authenticate, 
    authorize(['ADMIN']),
    tagController.updateTag
);

router.delete("/:id", 
    authenticate, 
    authorize(['ADMIN']),
    tagController.deleteTag
);

export default router;