import { ApiError } from "../utils/errors.js";

const bucket = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export function postRateLimiter(req, _res, next) {
  const userKey = req.user?.sub || req.ip;
  const now = Date.now();
  const entry = bucket.get(userKey) || { count: 0, resetAt: now + WINDOW_MS };

  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }

  entry.count += 1;
  bucket.set(userKey, entry);

  if (entry.count > MAX_REQUESTS) {
    return next(new ApiError(429, "Too many post submissions. Please slow down."));
  }

  return next();
}
