import { Router } from "express";
import bookController from "../controllers/bookController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js"; 
import validate from "../middleware/validationMiddleware.js";
import bookValidator from "../validators/bookValidator.js";
// import validate from "../middleware/validationMiddleware.js"; 
// import { bookSchema } from "../validators/bookValidator.js"; // Nanti tambahkan ini

const router = Router();

// --- Public Endpoints (Semua orang bisa lihat) ---

// 1. GET /api/books (List semua buku)
router.get("/", bookController.getAllBooks); 

// 2. GET /api/books/:id (Detail buku)
router.get("/:id", bookController.getBookById); 

// --- Protected Endpoints (Hanya Admin) ---

// 3. POST /api/books (Buat buku baru)
// Wajib Login (authenticate) DAN Wajib Role ADMIN (authorize(['ADMIN']))
router.post("/", 
    authenticate, 
    authorize(['ADMIN']),
    validate(bookValidator.bookSchema),
    bookController.createBook
); 

// 4. PUT /api/books/:id (Update buku)
router.put("/:id", 
    authenticate, 
    authorize(['ADMIN']),
    validate(bookValidator.bookSchema),
    bookController.updateBook
);

// 5. DELETE /api/books/:id (Hapus buku)
router.delete("/:id", 
    authenticate, 
    authorize(['ADMIN']),
    bookController.deleteBook
);

export default router;