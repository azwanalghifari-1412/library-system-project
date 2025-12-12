import Joi from 'joi';

const tagSchema = Joi.object({
    // Nama tag wajib diisi, minimal 2, maksimal 50 karakter
    name: Joi.string().required().min(2).max(50)
        .messages({
            'string.empty': 'Nama Tag wajib diisi.',
            'string.min': 'Nama Tag minimal 2 karakter.',
            'string.max': 'Nama Tag maksimal 50 karakter.'
        }),
});

const tagValidator = {
    tagSchema,
};

export default tagValidator;