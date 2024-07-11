import { ErrorClass } from "../utils/error-class.utils.js";

/**
 * @param {object} schema - Joi schema object
 * @returns {Function} - Middleware function to validate the request data against the schema
 * @description Middleware to validate request data (body, query, params, headers) against provided Joi schema
 */
const reqKeys = ["body", "query", "params", "headers"];

export const validationMiddleware = (schema) => {
  return async (req, res, next) => {
    try {
      // Initialize validation errors array
      const validationErrors = [];

      for (const key of reqKeys) {
        if (schema[key]) {
          // Validate the request data against the schema of the same key
          const { error } = schema[key].validate(req[key], {
            abortEarly: false,
          });

          // If there is an error, push the error details to the validationErrors array
          if (error) {
            validationErrors.push(...error.details);
          }
        }
      }

      // If there are validation errors, return the error response with the validation errors
      if (validationErrors.length) {
        return next(new ErrorClass("Validation Error", 400, validationErrors, "validationMiddleware"));
      }

      // If validation passes, proceed to the next middleware
      next();
    } catch (err) {
      next(err);
    }
  };
};
