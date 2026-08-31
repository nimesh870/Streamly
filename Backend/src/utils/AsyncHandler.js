const AsyncHandler = (func) => async (req , res , next) => {
    try {
        await func(req , res , next)
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success : false,
            error : error.message
        })
    }
}

export {AsyncHandler}