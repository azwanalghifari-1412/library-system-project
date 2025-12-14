import prisma from "../config/prisma.js";
import { buildQueryOptions } from '../utils/queryBuilder.js'; 
import { extractUniqueConstraintError } from '../utils/prismaUtils.js'; 

const searchableFields = ['name']; 
const sortableFields = ['id', 'name', 'createdAt'];

const getAllTags = async (req, res, next) => {
    try {
        const options = buildQueryOptions(req.query, searchableFields, sortableFields);
        const { where, orderBy, skip, take, page, limit } = options;
        const tagsPromise = prisma.tag.findMany({
            where,
            orderBy,
            skip,
            take,
            include: {
                _count: {
                    select: { bookTags: true }
                }
            }
        });

        const totalRecordsPromise = prisma.tag.count({ where });

        const [tags, totalRecords] = await Promise.all([tagsPromise, totalRecordsPromise]);

        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            success: true,
            message: "Tags list retrieved successfully.",
            meta: { 
                totalRecords,
                totalPages,
                currentPage: page,
                limit: limit,
            },
            data: tags.map(tag => ({
                ...tag,
                bookCount: tag._count.bookTags 
            })),
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
            include: { 
                bookTags: { 
                    include: { 
                        book: { select: { id: true, title: true, author: true } } 
                    } 
                } 
            } 
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
            const field = extractUniqueConstraintError(error) || 'name';
            return res.status(409).json({ success: false, message: `Tag creation failed: ${field} already exists.` });
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
            const field = extractUniqueConstraintError(error) || 'name';
            return res.status(409).json({ success: false, message: `Tag update failed: ${field} already exists.` });
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
        if (error.code === 'P2003') { 
             return res.status(409).json({ success: false, message: "Cannot delete tag: still linked to one or more books." });
        }
        next(error);
    }
};


const tagController = {
    getAllTags, getTagById, createTag, updateTag, deleteTag,
};

export default tagController;