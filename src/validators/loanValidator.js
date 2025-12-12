import Joi from 'joi';

const loanSchema = Joi.object({
    // bookId dan memberId wajib, harus berupa integer positif
    bookId: Joi.number().integer().required().min(1)
        .messages({
            'any.required': 'Book ID wajib diisi.',
            'number.base': 'Book ID harus berupa angka.',
            'number.min': 'Book ID harus lebih besar dari 0.'
        }),
        
    memberId: Joi.number().integer().required().min(1)
        .messages({
            'any.required': 'Member ID wajib diisi.',
            'number.base': 'Member ID harus berupa angka.',
            'number.min': 'Member ID harus lebih besar dari 0.'
        }),
    
    dueDate: Joi.date().iso().allow(null, '')
        .messages({
            'date.iso': 'Due Date harus dalam format tanggal ISO (YYYY-MM-DD).'
        }),
});

const loanValidator = {
    loanSchema,
};

export default loanValidator;