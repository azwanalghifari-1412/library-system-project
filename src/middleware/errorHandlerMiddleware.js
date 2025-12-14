const errorHandlerMiddleware = (err, req, res, next) => {
    console.error(err.stack); 

    const statusCode = err.statusCode || 500;

    let message = err.message || 'An unexpected error occurred.';

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        message = 'Invalid or expired authentication token.';
        return res.status(401).json({
            success: false,
            message: message,
        });
    }

    if (err.isJoi) {
        message = err.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
            success: false,
            message: message,
        });
    }

    res.status(statusCode).json({
        success: false,
        message: message,
    });
};

export default errorHandlerMiddleware;