export function errorMiddleware(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message || "Internal server error.",
    details: error.details || null
  });
}
