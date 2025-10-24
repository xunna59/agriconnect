const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.errors.map(e => e.message),
        });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'Unique Constraint Error',
            message: err.errors.map(e => e.message),
        });
    }

    // Handle network-related errors
    if (err.code === 'ECONNREFUSED') {
        return res.status(503).json({
            success: false,
            error: 'Network Error',
            message: 'Connection refused by the server',
        });
    }

    if (err.code === 'ETIMEDOUT') {
        return res.status(504).json({
            success: false,
            error: 'Network Error',
            message: 'Request timed out',
        });
    }

    if (err.code === 'ENOTFOUND') {
        return res.status(503).json({
            success: false,
            error: 'Network Error',
            message: 'Server not found',
        });
    }

    if (err.code === 'EHOSTUNREACH') {
        return res.status(503).json({
            error: 'Network Error',
            message: 'Host is unreachable',
        });
    }

    if (err.code === 'ECONNRESET') {
        return res.status(503).json({
            error: 'Network Error',
            details: 'Connection was reset by the server',
        });
    }



    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: err.message,
    });


};

module.exports = errorHandler;