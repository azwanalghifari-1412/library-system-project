import Joi from 'joi';

// Skema untuk CREATE/UPDATE member
const memberSchema = Joi.object({
    name: Joi.string().required().min(3).max(100),
    
    email: Joi.string().required().email({ tlds: { allow: false } }),
    
    phone: Joi.string().pattern(new RegExp('^[0-9]{8,15}$')).allow(null, '')
        .messages({
            'string.pattern.base': 'Nomor telepon harus berupa angka antara 8 hingga 15 digit.',
        }),
});

const memberValidator = {
    memberSchema,
};

export default memberValidator;