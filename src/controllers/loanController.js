import prisma from "../config/prisma.js";
import { format } from 'date-fns'; 

const FINE_PER_DAY = 1000; 

const getAllLoans = async (req, res, next) => {
    try {
        const loans = await prisma.loan.findMany({
            include: { 
                book: { select: { title: true, author: true } }, 
                member: { select: { name: true, email: true } } 
            },
            orderBy: { borrowDate: 'desc' }
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

const borrowBook = async (req, res, next) => {
    try {
        const { bookId, memberId } = req.body; 
        const borrowDate = new Date(); 

        const dueDate = new Date(borrowDate); 
        dueDate.setDate(borrowDate.getDate() + 7); 

        const book = await prisma.book.findUnique({ where: { id: bookId } });
        const member = await prisma.member.findUnique({ where: { id: memberId } });

        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found." });
        }
        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found." });
        }

        if (book.stock <= 0) {
            return res.status(400).json({ success: false, message: "Book is out of stock." });
        }

        const [newLoan, updatedBook] = await prisma.$transaction([
            prisma.loan.create({
                data: {
                    bookId: bookId,
                    memberId: memberId,
                    borrowDate: borrowDate,
                    dueDate: dueDate,
                    isReturned: false, 
                    fineAmount: 0,
                }
            }),
            prisma.book.update({
                where: { id: bookId },
                data: { stock: { decrement: 1 } }
            })
        ]);

        res.status(201).json({ 
            success: true, 
            message: "Book successfully borrowed. Stock updated.", 
            data: { 
                loan: {
                    ...newLoan,
                    borrowDate: format(newLoan.borrowDate, 'yyyy-MM-dd'),
                    dueDate: format(newLoan.dueDate, 'yyyy-MM-dd'),
                },
                newStock: updatedBook.stock 
            }
        });

    } catch (error) {
        next(error);
    }
};

const returnBook = async (req, res, next) => {
    try {
        const loanId = parseInt(req.params.id);
        const returnDate = new Date(); // Tanggal pengembalian hari ini

        const loan = await prisma.loan.findUnique({ where: { id: loanId } });

        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan record not found." });
        }
        
        if (loan.isReturned) {
            return res.status(400).json({ success: false, message: "Book already returned." });
        }
        
        const dueDate = new Date(loan.dueDate);
        let fineAmount = 0;
        let daysLate = 0;

        if (returnDate > dueDate) {
            const timeDiff = returnDate.getTime() - dueDate.getTime();
            daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            
            if (daysLate > 0) {
                 fineAmount = daysLate * FINE_PER_DAY;
            } else {
                 daysLate = 0;
            }
        }

        const [updatedLoan, updatedBook] = await prisma.$transaction([
            prisma.loan.update({
                where: { id: loanId },
                data: {
                    isReturned: true, 
                    returnDate: returnDate,
                    fineAmount: fineAmount, 
                }
            }),
            prisma.book.update({
                where: { id: loan.bookId },
                data: { stock: { increment: 1 } }
            })
        ]);

        res.json({ 
            success: true, 
            message: `Book successfully returned. Days late: ${daysLate}. Fine calculated: Rp ${fineAmount.toLocaleString('id-ID', { maximumFractionDigits: 0 })}. Stock updated.`,
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