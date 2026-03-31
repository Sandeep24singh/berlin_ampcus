import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/errors.js";

export function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return next(new ApiError(401, "Authentication token is required."));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token."));
  }
}

export function requireRole(role) {
  return function roleGuard(req, _res, next) {
    if (!req.user || req.user.role !== role) {
      return next(new ApiError(403, "You do not have access to this resource."));
    }
    return next();
  };
}
