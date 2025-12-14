import prisma from "../config/prisma.js";
import { buildQueryOptions } from '../utils/queryBuilder.js'; 
import { extractUniqueConstraintError } from '../utils/prismaUtils.js'; 

const searchableFields = ['title', 'author', 'isbn']; 
const sortableFields = ['id', 'title', 'author', 'stock', 'createdAt'];

const getAllBooks = async (req, res, next) => {
    try {
        const options = buildQueryOptions(req.query, searchableFields, sortableFields);
        const { where, orderBy, skip, take, page, limit } = options;

        const booksPromise = prisma.book.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
                id: true, title: true, author: true, stock: true, isbn: true,
                createdBy: { select: { name: true } }, 
            },
        });

        const totalRecordsPromise = prisma.book.count({ where });

        const [books, totalRecords] = await Promise.all([booksPromise, totalRecordsPromise]);

        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            success: true,
            message: "Books list retrieved successfully.",
            meta: { 
                totalRecords,
                totalPages,
                currentPage: page,
                limit: limit,
            },
            data: books,
        });
    } catch (error) {
        next(error);
    }
};

const getBookById = async (req, res, next) => {
    try {
        const bookId = parseInt(req.params.id);
        const book = await prisma.book.findUnique({
            where: { id: bookId },
            include: { 
                createdBy: { select: { name: true } },
                // Jika bookTags menggunakan relasi many-to-many, ini sudah benar
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

const createBook = async (req, res, next) => {
    try {
        const { title, author, publisher, year, stock, isbn } = req.body;
        
        const createdById = req.user.id; 

        const newBook = await prisma.book.create({
            data: { 
                title, author, publisher, year: parseInt(year), stock: parseInt(stock) || 1, isbn,
                createdById,
            },
            select: { id: true, title: true, author: true, stock: true, isbn: true, createdBy: { select: { name: true } } }
        });

        res.status(201).json({ success: true, message: "Book created successfully.", data: newBook });

    } catch (error) {
        if (error.code === 'P2002') {
            const field = extractUniqueConstraintError(error) || 'data';
            return res.status(409).json({
                success: false,
                message: `Book creation failed: ${field} already exists.`,
            });
        }
        next(error);
    }
};

const updateBook = async (req, res, next) => {
    try {
        const bookId = parseInt(req.params.id);
        const data = req.body; 

        if (data.stock) data.stock = parseInt(data.stock);
        if (data.year) data.year = parseInt(data.year);

        const updatedBook = await prisma.book.update({
            where: { id: bookId },
            data: data,
            select: { id: true, title: true, author: true, stock: true, isbn: true }
        });

        res.json({ success: true, message: "Book updated successfully.", data: updatedBook });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Book not found." });
        }
        if (error.code === 'P2002') {
            const field = extractUniqueConstraintError(error) || 'data';
            return res.status(409).json({
                success: false,
                message: `Book update failed: ${field} already exists.`,
            });
        }
        next(error);
    }
};

const deleteBook = async (req, res, next) => {
    try {
        const bookId = parseInt(req.params.id);
        
        await prisma.book.delete({
            where: { id: bookId },
        });

        res.status(204).json(); 

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