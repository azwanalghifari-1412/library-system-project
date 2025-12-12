// src/routes/loanRoute.js

import { Router } from "express";
import loanController from "../controllers/loanController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js"; 

const router = Router();

// Middleware Level: Amankan SEMUA route di sini dengan ADMIN
router.use(authenticate, authorize(['ADMIN']));

// 1. GET /api/loans (List semua transaksi pinjaman)
router.get("/", loanController.getAllLoans); 

// 2. POST /api/loans (Pinjam Buku)
router.post("/", loanController.borrowBook); 

// 3. PUT /api/loans/:id/return (Pengembalian Buku)
router.put("/:id/return", loanController.returnBook);

export default router;