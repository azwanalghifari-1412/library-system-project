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

const updateUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, email, role } = req.body;
        
        // 🎯 Otorisasi: Hanya ADMIN yang boleh mengedit user lain ATAU user itu sendiri
        if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
            return res.status(403).json({ success: false, message: "Authorization failed: Cannot update other user's data." });
        }
        
        // 🛑 Pencegahan: User biasa tidak boleh mengubah role
        if (req.user.role !== 'ADMIN' && role) {
             return res.status(403).json({ success: false, message: "Authorization failed: Only Admin can change user roles." });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, email, role },
            select: { id: true, name: true, email: true, role: true }
        });

        res.json({
            success: true,
            message: "User updated successfully.",
            data: updatedUser,
        });

    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        
        
        await prisma.user.delete({
            where: { id: userId },
        });

        res.status(204).json(); // 204 No Content untuk operasi DELETE sukses

    } catch (error) {
        // Jika user tidak ditemukan, Prisma akan melempar error
        if (error.code === 'P2025') { 
             return res.status(404).json({ success: false, message: "User not found." });
        }
        next(error);
    }
};

const userController = {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};

export default userController;
//