import prisma from "../config/prisma.js";

const getAllMembers = async (req, res, next) => {
    try {
        const members = await prisma.member.findMany({
            select: { id: true, name: true, email: true, phone: true, createdAt: true },
            orderBy: { id: 'asc' }
        });

        res.json({
            success: true,
            message: "All members retrieved successfully.",
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
            include: { loans: true } 
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
            return res.status(409).json({ success: false, message: "Registration failed: Email already registered." });
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
            return res.status(409).json({ success: false, message: "Update failed: Email already exists." });
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
        next(error);
    }
};


const memberController = {
    getAllMembers, getMemberById, createMember, updateMember, deleteMember,
};

export default memberController;