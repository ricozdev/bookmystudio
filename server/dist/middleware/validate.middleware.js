"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
const zod_1 = require("zod");
function validateBody(schema) {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const fieldErrors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    if (!fieldErrors[path]) {
                        fieldErrors[path] = err.message;
                    }
                });
                res.status(422).json({
                    success: false,
                    error: 'Validation failed',
                    details: fieldErrors,
                    message: error.errors[0]?.message || 'Invalid input data',
                });
                return;
            }
            next(error);
        }
    };
}
function validateQuery(schema) {
    return async (req, res, next) => {
        try {
            req.query = (await schema.parseAsync(req.query));
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const fieldErrors = {};
                error.errors.forEach((err) => {
                    const path = err.path.join('.');
                    if (!fieldErrors[path]) {
                        fieldErrors[path] = err.message;
                    }
                });
                res.status(400).json({
                    success: false,
                    error: 'Invalid query parameters',
                    details: fieldErrors,
                    message: error.errors[0]?.message || 'Invalid query parameters',
                });
                return;
            }
            next(error);
        }
    };
}
//# sourceMappingURL=validate.middleware.js.map