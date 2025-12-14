import prisma from "../config/prisma.js";
import { buildQueryOptions } from '../utils/queryBuilder.js';
import { extractUniqueConstraintError } from '../utils/prismaUtils.js';

const searchableFields = ['name', 'email', 'role']; 
const sortableFields = ['id', 'name', 'email', 'role', 'createdAt'];

const getAllUsers = async (req, res, next) => {
    try {
        const options = buildQueryOptions(req.query, searchableFields, sortableFields);
        const { where, orderBy, skip, take, page, limit } = options;
        
        // Penanganan Filter khusus untuk 'role' jika ada
        if (req.query.role) {
             where.role = req.query.role.toUpperCase();
        }

        const usersPromise = prisma.user.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        
        const totalRecordsPromise = prisma.user.count({ where });

        const [users, totalRecords] = await Promise.all([usersPromise, totalRecordsPromise]);
        
        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            success: true,
            message: "All users retrieved successfully.",
            meta: {
                totalRecords,
                totalPages,
                currentPage: page,
                limit: limit,
            },
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
        
        if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
            return res.status(403).json({ success: false, message: "Authorization failed: Cannot update other user's data." });
        }
        
        if (req.user.role !== 'ADMIN' && role) {
             return res.status(403).json({ success: false, message: "Authorization failed: Only Admin can change user roles." });
        }
        
        const dataToUpdate = {};
        if (name) dataToUpdate.name = name;
        if (email) dataToUpdate.email = email;
        if (role) dataToUpdate.role = role.toUpperCase(); // Pastikan role uppercase

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: { id: true, name: true, email: true, role: true }
        });

        res.json({
            success: true,
            message: "User updated successfully.",
            data: updatedUser,
        });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        // Penanganan Error Duplikasi Email
        if (error.code === 'P2002') { 
            const field = extractUniqueConstraintError(error) || 'email';
            return res.status(409).json({ success: false, message: `Update failed: ${field} already exists.` });
        }
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Otorisasi: Hanya ADMIN yang boleh menghapus user (kecuali user itu sendiri, ini opsional)
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: "Authorization failed: Only Admin can delete user accounts." });
        }
        
        await prisma.user.delete({
            where: { id: userId },
        });

        res.status(204).json();

    } catch (error) {
        if (error.code === 'P2025') { 
             return res.status(404).json({ success: false, message: "User not found." });
        }
        // Penanganan error Foreign Key jika user masih membuat data (buku, dll)
        if (error.code === 'P2003') { 
             return res.status(409).json({ success: false, message: "Cannot delete user: still linked to existing records (e.g., created books)." });
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