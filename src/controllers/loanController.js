import prisma from "../config/prisma.js";

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

const borrowBook = async (req, res, next) => {
    try {
        const { bookId, memberId, dueDate } = req.body;

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
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    status: "BORROWED"
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
            data: { loan: newLoan, newStock: updatedBook.stock }
        });

    } catch (error) {
        next(error);
    }
};

const returnBook = async (req, res, next) => {
    try {
        const loanId = parseInt(req.params.id);

        const loan = await prisma.loan.findUnique({ where: { id: loanId } });

        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan record not found." });
        }

        if (loan.status !== "BORROWED") {
            return res.status(400).json({ success: false, message: "Book already returned or loan status is invalid." });
        }

        const [updatedLoan, updatedBook] = await prisma.$transaction([
            prisma.loan.update({
                where: { id: loanId },
                data: {
                    status: "RETURNED",
                    returnDate: new Date(),
                }
            }),
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