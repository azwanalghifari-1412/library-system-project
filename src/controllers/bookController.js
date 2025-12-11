import prisma from "../config/prisma.js";

// --- CRUD Operations ---

// 1. GET ALL BOOKS (List)
const getAllBooks = async (req, res, next) => {
    try {
        const books = await prisma.book.findMany({
            select: {
                id: true, title: true, author: true, stock: true,
                createdBy: { select: { name: true } }, // Tampilkan nama user yang membuat
            },
            orderBy: { id: 'asc' }
        });

        res.json({
            success: true,
            message: "Books list retrieved successfully.",
            data: books,
        });
    } catch (error) {
        next(error);
    }
};

// 2. GET BOOK BY ID (Detail)
const getBookById = async (req, res, next) => {
    try {
        const bookId = parseInt(req.params.id);
        const book = await prisma.book.findUnique({
            where: { id: bookId },
            include: { 
                createdBy: { select: { name: true } },
                bookTags: { include: { tag: true } } 
            }
        });

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found." });
        }

        res.json({ success: true, message: "Book retrieved successfully.", data: book });
    } catch (error) {
        next(error);
    }
};

// 3. CREATE BOOK (Hanya Admin)
const createBook = async (req, res, next) => {
    try {
        // Asumsi data validasi sudah lolos, dan req.body memiliki data buku
        const { title, author, publisher, year, stock } = req.body;
        
        // createdById diambil dari token yang diverifikasi oleh authenticate middleware
        const createdById = req.user.id; 

        const newBook = await prisma.book.create({
            data: { 
                title, author, publisher, year: parseInt(year), stock: parseInt(stock) || 1,
                createdById,
            },
            select: { id: true, title: true, author: true, stock: true, createdBy: { select: { name: true } } }
        });

        res.status(201).json({ success: true, message: "Book created successfully.", data: newBook });

    } catch (error) {
        next(error);
    }
};

// 4. UPDATE BOOK (Hanya Admin)
const updateBook = async (req, res, next) => {
    try {
        const bookId = parseInt(req.params.id);
        const data = req.body; // Ambil semua data dari body

        // Konversi stock dan year ke integer jika ada
        if (data.stock) data.stock = parseInt(data.stock);
        if (data.year) data.year = parseInt(data.year);

        const updatedBook = await prisma.book.update({
            where: { id: bookId },
            data: data,
            select: { id: true, title: true, author: true, stock: true }
        });

        res.json({ success: true, message: "Book updated successfully.", data: updatedBook });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Book not found." });
        }
        next(error);
    }
};

// 5. DELETE BOOK (Hanya Admin)
const deleteBook = async (req, res, next) => {
    try {
        const bookId = parseInt(req.params.id);
        
        await prisma.book.delete({
            where: { id: bookId },
        });

        res.status(204).json(); // 204 No Content

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Book not found." });
        }
        next(error);
    }
};


const bookController = {
    getAllBooks, getBookById, createBook, updateBook, deleteBook,
};

export default bookController;