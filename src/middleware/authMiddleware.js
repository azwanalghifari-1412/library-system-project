import jwt from "jsonwebtoken";

import { JWT_SECRET } from "../config/jwt.js"; 

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: "Authentication failed: No token provided." 
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded; 
        
        next();

    } catch (error) {
        let message = "Authentication failed: Invalid or expired token.";

        if (error.name === 'TokenExpiredError') {
             message = "Authentication failed: Token has expired. Please refresh token.";
        }
        
        return res.status(401).json({
            success: false,
            message: message
        });
    }
};

const authorize = (roles = []) => (req, res, next) => {
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    const userRole = req.user?.role;

    if (!userRole || (!roles.includes(userRole) && userRole !== 'ADMIN')) {
        return res.status(403).json({
            success: false,
            message: "Authorization failed: Insufficient permissions."
        });
    }
    next();
};


export { authenticate, authorize };