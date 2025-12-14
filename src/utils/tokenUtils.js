import jwt from 'jsonwebtoken';
import { 
    JWT_SECRET, 
    JWT_EXPIRATION, 
    JWT_REFRESH_SECRET, 
    JWT_REFRESH_EXPIRES_IN 
} from '../config/jwt.js';

export const createAccessToken = (userPayload) => {
    return jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION, // '1h'
    });
};

export const createRefreshToken = (userPayload) => {
    
    return jwt.sign(userPayload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN, // '7d'
    });
};

export const verifyToken = (token, isRefresh = false) => {
    try {
        const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
        return jwt.verify(token, secret);
    } catch (error) {
        return null; 
    }
};

export const generateAuthTokens = (user) => {
    const userPayload = { 
        id: user.id, 
        email: user.email, 
        role: user.role 
    };

    const accessToken = createAccessToken(userPayload);
    const refreshToken = createRefreshToken(userPayload);

    return { accessToken, refreshToken };
};