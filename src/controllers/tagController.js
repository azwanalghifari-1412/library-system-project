import prisma from "../config/prisma.js";

const getAllTags = async (req, res, next) => {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' }
        });

        res.json({
            success: true,
            message: "Tags list retrieved successfully.",
            data: tags,
        });
    } catch (error) {
        next(error);
    }
};

const getTagById = async (req, res, next) => {
    try {
        const tagId = parseInt(req.params.id);
        const tag = await prisma.tag.findUnique({
            where: { id: tagId },
            include: { bookTags: { include: { book: true } } } 
        });

        if (!tag) {
            return res.status(404).json({ success: false, message: "Tag not found." });
        }

        res.json({ success: true, message: "Tag retrieved successfully.", data: tag });
    } catch (error) {
        next(error);
    }
};

const createTag = async (req, res, next) => {
    try {
        const { name } = req.body;
        
        const newTag = await prisma.tag.create({
            data: { name: name.toUpperCase() },
        });

        res.status(201).json({ success: true, message: "Tag created successfully.", data: newTag });

    } catch (error) {
        if (error.code === 'P2002') { 
            return res.status(409).json({ success: false, message: "Tag name already exists." });
        }
        next(error);
    }
};

const updateTag = async (req, res, next) => {
    try {
        const tagId = parseInt(req.params.id);
        const { name } = req.body;

        const updatedTag = await prisma.tag.update({
            where: { id: tagId },
            data: { name: name ? name.toUpperCase() : undefined },
        });

        res.json({ success: true, message: "Tag updated successfully.", data: updatedTag });

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Tag not found." });
        }
        if (error.code === 'P2002') { 
            return res.status(409).json({ success: false, message: "Tag name already exists." });
        }
        next(error);
    }
};

const deleteTag = async (req, res, next) => {
    try {
        const tagId = parseInt(req.params.id);
        
        await prisma.tag.delete({
            where: { id: tagId },
        });

        res.status(204).json();

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: "Tag not found." });
        }
        next(error);
    }
};


const tagController = {
    getAllTags, getTagById, createTag, updateTag, deleteTag,
};

export default tagController;