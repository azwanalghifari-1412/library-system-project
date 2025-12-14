import dotenv from 'dotenv';
dotenv.config();

// Export secret key dari environment
export const JWT_SECRET = process.env.JWT_SECRET;

// Export waktu kadaluarsa (praktik yang baik)
export const JWT_EXPIRATION = '1h';

export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';