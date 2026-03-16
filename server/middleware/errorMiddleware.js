/**
 * Middleware to handle 404 Not Found errors.
 * Replaces Express's default HTML 404 response with a structured JSON error.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  // Pass the error to the global error handler
  next(error);
};

/**
 * Global Error Handler Middleware.
 * Catches all errors passed to next() and formats them consistently.
 */
export const errorHandler = (err, req, res, next) => {
  // If the status code is still 200, change it to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode);

  res.json({
    message: err.message,
    // Only show the stack trace if we are not in production mode
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
