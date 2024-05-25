// Creating our own extended Error class
// Documentation of the previous error class is avalibale at nodejs website

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went Wrong",
        errors = [], // Filled With an Empty Array
        statck = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        // Check for what is error.data
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (statck) {
            this.statch = statck;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
