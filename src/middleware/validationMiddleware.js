const validate = (schema) => (req, res, next) => {
    // Gabungkan body, query, dan params untuk validasi menyeluruh
    const { error, value } = schema.validate(req.body, {
        abortEarly: false, 
        allowUnknown: true 
    });

    if (error) {
        // Jika ada error validasi
        const errorMessages = error.details.map((detail) => {
            return { 
                field: detail.context.key, 
                message: detail.message.replace(/['"]/g, '') 
            };
        });

        // Struktur respons error standar
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errorMessages,
        });
    }

    // Data sudah divalidasi, lampirkan data bersih ke request
    req.validatedData = value;
    next(); 
};

export default validate;