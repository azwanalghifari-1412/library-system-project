// src/validators/bookValidator.js

import Joi from "joi";

const bookSchema = Joi.object({
    title: Joi.string().required().max(255),
    author: Joi.string().required().max(255),
    publisher: Joi.string().max(255).allow(null, ''), // Opsional, bisa null atau string kosong
    year: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null), // Tahun harus angka
    stock: Joi.number().integer().min(0).default(1), // Stock harus angka, minimal 0
    // createdById tidak dimasukkan karena diambil dari req.user, bukan req.body
});

const bookValidator = {
    bookSchema
};

export default bookValidator;