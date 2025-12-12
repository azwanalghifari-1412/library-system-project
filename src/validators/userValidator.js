import Joi from "joi";

// Skema untuk pendaftaran pengguna baru
const registerSchema = Joi.object({
    name: Joi.string().required().min(3).max(100)
        .messages({
            'string.empty': 'Name is required.',
            'string.min': 'Name must be at least 3 characters long.',
            'any.required': 'Name is required.'
        }),
    email: Joi.string().required().email()
        .messages({
            'string.empty': 'Email is required.',
            'string.email': 'Email format is invalid.',
            'any.required': 'Email is required.'
        }),
    password: Joi.string().required().min(6)
        .messages({
            'string.empty': 'Password is required.',
            'string.min': 'Password must be at least 6 characters long.',
            'any.required': 'Password is required.'
        }),
});

// Skema untuk login
const loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
});

// Skema untuk UPDATE user (semua field opsional)
const userUpdateSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    email: Joi.string().email({ tlds: { allow: false } }),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])')),
    role: Joi.string().valid('USER', 'ADMIN'), 
});

const userValidator = {
    registerSchema,
    loginSchema,
    userUpdateSchema,
};

export default userValidator;