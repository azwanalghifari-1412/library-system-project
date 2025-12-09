import Joi from 'joi';

// Skema untuk pendaftaran pengguna baru
const registerSchema = Joi.object({
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
        .email({ tlds: { allow: false } }) // Menonaktifkan cek Top-Level Domain (TLD)
        .required()
        .messages({
            'string.base': 'Email harus berupa teks.',
            'string.empty': 'Email tidak boleh kosong.',
            'string.email': 'Format email tidak valid.',
            'any.required': 'Email wajib diisi.'
        }),

    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])')) // Minimal 1 huruf kecil, 1 huruf besar, 1 angka
        .required()
        .messages({
            'string.base': 'Password harus berupa teks.',
            'string.empty': 'Password tidak boleh kosong.',
            'string.min': 'Password minimal memiliki {#limit} karakter.',
            'object.regex': 'Password harus mengandung minimal satu huruf besar, satu huruf kecil, dan satu angka.',
            'any.required': 'Password wajib diisi.'
        }),
});

// Skema untuk login
const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
        
    password: Joi.string()
        .required(),
});


export { registerSchema, loginSchema };