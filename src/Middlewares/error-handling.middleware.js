import { ErrorClass } from "../utils/error-class.utils.js";

/**
 * @param {Function} API - The API function to be wrapped with error handling
 * @returns {Function} - Middleware function to handle errors from the API function
 * @description Middleware to handle errors for asynchronous API functions
 */
export const errorHandler = (API) => {
  return (req, res, next) => {
    const result = API(req, res, next);
    if (result && typeof result.catch === 'function') {
      result.catch((err) => {
        next(new ErrorClass("Internal Server error", 500, err.message, "errorHandler"));
      });
    } else {
      next(new ErrorClass("API did not return a promise", 500));
    }
  };
};

/**
 * @description Global error handler to format and send error responses
 */
export const globaleResponse = (err, req, res, next) => {
  if (err) {
    res.status(err.status || 500).json({
      message: "Fail response",
      err_msg: err.message,
      err_location: err.location,
      err_data: err.data,
    });
  }
};
