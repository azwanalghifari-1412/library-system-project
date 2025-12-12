// src/controllers/loanController.js

import prisma from "../config/prisma.js";

// 1. GET ALL LOANS (Riwayat Pinjaman - ADMIN ONLY)
const getAllLoans = async (req, res, next) => {
    try {
        const loans = await prisma.loan.findMany({
            include: { 
                book: { select: { title: true, author: true } }, 
                member: { select: { name: true, email: true } } 
            },
            orderBy: { loanDate: 'desc' }
        });

        res.json({
            success: true,
            message: "All loan records retrieved successfully.",
            data: loans,
        });
    } catch (error) {
        next(error);
    }
};


// 2. BORROW BOOK (POST /api/loans) - Peminjaman
const borrowBook = async (req, res, next) => {
    try {
        const { bookId, memberId, dueDate } = req.body;
        
        // 1. Validasi Keberadaan Buku dan Member
        const book = await prisma.book.findUnique({ where: { id: bookId } });
        const member = await prisma.member.findUnique({ where: { id: memberId } });

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found." });
        }
        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found." });
        }

        // 2. Cek Stok Buku
        if (book.stock <= 0) {
            return res.status(400).json({ success: false, message: "Book is out of stock." });
        }
        
        // 3. Buat Transaksi Pinjaman dan Kurangi Stok (Prisma Transaction)
        const [newLoan, updatedBook] = await prisma.$transaction([
            // Transaksi 1: Buat record Loan
            prisma.loan.create({
                data: {
                    bookId: bookId,
                    memberId: memberId,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    status: "BORROWED"
                }
            }),
            // Transaksi 2: Kurangi stok buku
            prisma.book.update({
                where: { id: bookId },
                data: { stock: { decrement: 1 } }
            })
        ]);

        res.status(201).json({ 
            success: true, 
            message: "Book successfully borrowed. Stock updated.", 
            data: { loan: newLoan, newStock: updatedBook.stock }
        });

    } catch (error) {
        next(error);
    }
};

// 3. RETURN BOOK (PUT /api/loans/:id/return) - Pengembalian
const returnBook = async (req, res, next) => {
    try {
        const loanId = parseInt(req.params.id);

        // 1. Cari Loan
        const loan = await prisma.loan.findUnique({ where: { id: loanId } });

        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan record not found." });
        }

        // 2. Cek Status (Pastikan belum dikembalikan)
        if (loan.status !== "BORROWED") {
            return res.status(400).json({ success: false, message: "Book already returned or loan status is invalid." });
        }
        
        // 3. Update Loan Status dan Tambah Stok (Prisma Transaction)
        const [updatedLoan, updatedBook] = await prisma.$transaction([
            // Transaksi 1: Update record Loan (Set status = RETURNED, set returnDate)
            prisma.loan.update({
                where: { id: loanId },
                data: {
                    status: "RETURNED",
                    returnDate: new Date(),
                }
            }),
            // Transaksi 2: Tambah stok buku
            prisma.book.update({
                where: { id: loan.bookId },
                data: { stock: { increment: 1 } }
            })
        ]);

        res.json({ 
            success: true, 
            message: "Book successfully returned. Stock updated.", 
            data: { loan: updatedLoan, newStock: updatedBook.stock }
        });

    } catch (error) {
        next(error);
    }
};

const loanController = {
    getAllLoans,
    borrowBook,
    returnBook,
};

export default loanController;