// const asyncHandler = () => {};

// A False or a error / Bug Function
// const asyncHandler = (requestHandler) => {
//     (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) => {
//             next(err);
//             // The next(err) will transfer the error to the next middleware in the line
//         });
//     };
// };
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            next(err);
            // The next(err) will transfer the error to the next middleware in the line
        });
    };
};

export { asyncHandler };

// const asyncHandler = () => {}
// const asyncHandler = (func) => {}
// const asyncHandler = (func) => {(func2) => {}}
// const asyncHandler = (func) => {async (func2) => {}}

// Try and catch flag method
// const asyncHandler = (fn) => {
//     async (req, res, next) => {
//         try {
//             await fn(req, res, next);
//         } catch (err) {
//             res.status(err.code || 500).json({
//                 success: false,
//                 message: err.message,
//             });
//         }
//     };
// };
