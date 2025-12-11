import prisma from "../config/prisma.js";

const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                id: 'asc'
            }
        });

        res.json({
            success: true,
            message: "All users retrieved successfully.",
            data: users,
        });

    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
            return res.status(403).json({ success: false, message: "Authorization failed: Cannot access other user's data." });
        }

        res.json({
            success: true,
            message: "User retrieved successfully.",
            data: user,
        });

    } catch (error) {
        next(error);
    }
};

const userController = {
    getAllUsers,
    getUserById,
};

export default userController;