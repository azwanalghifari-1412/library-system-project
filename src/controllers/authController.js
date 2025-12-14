import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

import { generateAuthTokens } from '../utils/tokenUtils.js';

import { extractUniqueConstraintError } from '../utils/prismaUtils.js';

import jwt from "jsonwebtoken"; 

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10); 

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER', 
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: newUser,
        });

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

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Login failed: Invalid email or password."
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Login failed: Invalid email or password."
            });
        }

        const { accessToken, refreshToken } = generateAuthTokens(user);

        res.json({
            success: true,
            message: "Login successful.",
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                accessToken,
                refreshToken,
            },
        });

    } catch (error) {
        next(error);
    }
};

const handleRefreshToken = async (req, res, next) => {
    const { refreshToken } = req.body; 

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Refresh token is missing." });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); 

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true, name: true }
        });

        if (!user) {
            return res.status(403).json({ success: false, message: "Invalid user linked to refresh token." });
        }

        const { accessToken } = generateAuthTokens(user); 

        res.json({
            success: true,
            message: "Access token refreshed successfully.",
            data: {
                accessToken,
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
            }
        });

    } catch (error) {
        res.status(403).json({ success: false, message: "Invalid or expired refresh token." });
    }
};

const getMe = async (req, res, next) => {
    try {
        const { id } = req.user; 
        
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
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

        res.json({
            success: true,
            message: "User profile retrieved successfully.",
            data: user,
        });

    } catch (error) {
        next(error);
    }
};

const authController = {
    register,
    login,
    getMe,
    handleRefreshToken, 
};

export default authController;