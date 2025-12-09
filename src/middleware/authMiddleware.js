import jwt from "jsonwebtoken";

// Middleware untuk memverifikasi JWT dan mengotentikasi pengguna
const authenticate = (req, res, next) => {
    try {
        // 1. Ambil token dari header Authorization: Bearer <token>
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Jika header tidak ada atau formatnya salah
            return res.status(401).json({ 
                success: false, 
                message: "Authentication failed: No token provided." 
            });
        }

        // Ambil token (hapus 'Bearer ')
        const token = authHeader.split(' ')[1];

        // 2. Verifikasi token menggunakan JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Tambahkan data pengguna (id, email, role) ke request object
        req.user = decoded; 
        
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed: Invalid or expired token."
        });
    }
};

// Middleware untuk Otorisasi (cek peran/role)
const authorize = (roles = []) => (req, res, next) => {
    // req.user sudah ditambahkan oleh middleware authenticate
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Authorization failed: Insufficient permissions."
        });
    }
    next();
};


export { authenticate, authorize };