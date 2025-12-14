import prisma from "../config/prisma.js";
import { buildQueryOptions } from '../utils/queryBuilder.js'; 
import { extractUniqueConstraintError } from '../utils/prismaUtils.js'; 

const searchableFields = ['name', 'email', 'phone'];
const sortableFields = ['id', 'name', 'email', 'phone', 'createdAt'];

const getAllMembers = async (req, res, next) => {
    try {
        const options = buildQueryOptions(req.query, searchableFields, sortableFields);
        const { where, orderBy, skip, take, page, limit } = options;

        const membersPromise = prisma.member.findMany({
            where,
            orderBy,
            skip,
            take,
            select: { id: true, name: true, email: true, phone: true, createdAt: true },
        });

        const totalRecordsPromise = prisma.member.count({ where });

        const [members, totalRecords] = await Promise.all([membersPromise, totalRecordsPromise]);

        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            success: true,
            message: "All members retrieved successfully.",
            meta: { 
                totalRecords,
                totalPages,
                currentPage: page,
                limit: limit,
            },
            data: members,
        });
    } catch (error) {
        next(error);
    }
};

const getMemberById = async (req, res, next) => {
    try {
        const memberId = parseInt(req.params.id);
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { 
                loans: {
                    select: {
                        id: true,
                        borrowDate: true,
                        dueDate: true,
                        isReturned: true,
                        book: { select: { title: true, author: true, isbn: true } }
                    }
                } 
            } 
        });

        if (!member) {
            return res.status(404).json({ success: false, message: "Member not found." });
        }

        res.json({ success: true, message: "Member retrieved successfully.", data: member });
    } catch (error) {
        next(error);
    }
};

const createMember = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;

        const newMember = await prisma.member.create({
            data: { name, email, phone },
            select: { id: true, name: true, email: true, phone: true }
        });

        res.status(201).json({ success: true, message: "Member registered successfully.", data: newMember });

    } catch (error) {
        if (error.code === 'P2002') { 
            const field = extractUniqueConstraintError(error) || 'data';
            return res.status(409).json({ 
                success: false, 
                message: `Registration failed: ${field} already registered.`,
            });
        }
        next(error);
    }
};

const updateMember = async (req, res, next) => {
    try {
        const memberId = parseInt(req.params.id);
        const data = req.body;

        const updatedMember = await prisma.member.update({
            where: { id: memberId },
            data: data,
            select: { id: true, name: true, email: true, phone: true }
        });

        res.json({ success: true, message: "Member updated successfully.", data: updatedMember });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Member not found." });
        }
        if (error.code === 'P2002') {
            const field = extractUniqueConstraintError(error) || 'data';
            return res.status(409).json({ 
                success: false, 
                message: `Update failed: ${field} already exists.`,
            });
        }
        next(error);
    }
};

const deleteMember = async (req, res, next) => {
    try {
        const memberId = parseInt(req.params.id);

        await prisma.member.delete({
            where: { id: memberId },
        });

        res.status(204).json();

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Member not found." });
        }

        if (error.code === 'P2003') { 
             return res.status(409).json({ success: false, message: "Cannot delete member: still linked to active loans or records." });
        }
        
        next(error);
    }
};


const memberController = {
    getAllMembers, getMemberById, createMember, updateMember, deleteMember,
};

export default memberController;