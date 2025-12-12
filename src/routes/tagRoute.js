import { Router } from "express";
import tagController from "../controllers/tagController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";
import tagValidator from "../validators/tagValidator.js";

const router = Router();

router.get("/", tagController.getAllTags); 

router.get("/:id", tagController.getTagById); 

router.post("/", 
    authenticate, 
    authorize(['ADMIN']),
    validate(tagValidator.tagSchema),
    tagController.createTag
); 

router.put("/:id", 
    authenticate, 
    authorize(['ADMIN']),
    validate(tagValidator.tagSchema),
    tagController.updateTag
);

router.delete("/:id", 
    authenticate, 
    authorize(['ADMIN']),
    tagController.deleteTag
);

export default router;