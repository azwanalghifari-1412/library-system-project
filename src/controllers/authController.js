import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Ambil SALT_ROUNDS dari environment 
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10); 

// Logika Pendaftaran Pengguna Baru
const register = async (req, res, next) => {
    try {
        // Data yang sudah bersih dari validationMiddleware
        const { name, email, password } = req.validatedData;

        // 1. Cek Duplikasi Email
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Jika email sudah terdaftar, kembalikan 409 Conflict
            return res.status(409).json({
                success: false,
                message: "Registration failed: Email already registered."
            });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 3. Simpan Pengguna ke Database
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER', // Default role untuk pengguna baru
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        // 4. Respons Berhasil
        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: newUser,
        });

    } catch (error) {
        next(error); 
    }
};

const login = async (req, res, next) => {
    try {
        // Data yang sudah bersih dari validationMiddleware
        const { email, password } = req.validatedData;

        // 1. Cari Pengguna Berdasarkan Email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Login failed: Invalid email or password."
            });
        }

        // 2. Bandingkan Password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Login failed: Invalid email or password."
            });
        }

        // 3. Generate Access Token (JWT)
        const accessToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
        );

        // 4. Generate Refresh Token
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
        );

        // 5. Respons Berhasil
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

// Logika Mendapatkan Data Pengguna yang Sedang Login
const getMe = async (req, res, next) => {
    try {
        // req.user diisi oleh middleware authenticate
        const { id } = req.user; 
        
        // Ambil data pengguna dari database (untuk memastikan data terbaru)
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
            // Seharusnya tidak terjadi jika token valid, tapi ini adalah langkah keamanan
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

// Ekspor semua fungsi controller
const authController = {
    register,
    login,
    getMe,
    // Di sini nanti akan ada refresh, dll.
};

export default authController;