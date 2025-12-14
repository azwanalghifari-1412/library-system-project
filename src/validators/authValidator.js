import Joi from 'joi';

const registerValidator = Joi.object({ 
    name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.base': 'Nama harus berupa teks.',
            'string.empty': 'Nama tidak boleh kosong.',
            'string.min': 'Nama minimal memiliki {#limit} karakter.',
            'string.max': 'Nama maksimal memiliki {#limit} karakter.',
            'any.required': 'Nama wajib diisi.'
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } }) 
        .required()
        .messages({
            'string.base': 'Email harus berupa teks.',
            'string.empty': 'Email tidak boleh kosong.',
            'string.email': 'Format email tidak valid.',
            'any.required': 'Email wajib diisi.'
        }),

    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])')) 
        .required()
        .messages({
            'string.base': 'Password harus berupa teks.',
            'string.empty': 'Password tidak boleh kosong.',
            'string.min': 'Password minimal memiliki {#limit} karakter.',
            'string.pattern.base': 'Password harus mengandung minimal satu huruf besar, satu huruf kecil, dan satu angka.',
            'any.required': 'Password wajib diisi.'
        }),
});

// Skema untuk login
const loginValidator = Joi.object({ 
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
        
    password: Joi.string()
        .required(),
});

// Skema untuk Refresh Token
const refreshTokenValidator = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'string.empty': 'Refresh token tidak boleh kosong.',
            'any.required': 'Refresh token wajib diisi.'
        }),
});


export { registerValidator, loginValidator, refreshTokenValidator };