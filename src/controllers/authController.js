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


// Ekspor semua fungsi controller
const authController = {
    register,
    // Di sini nanti akan ada login, refresh, dll.
};

export default authController;