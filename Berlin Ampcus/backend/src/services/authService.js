import { User } from "../models/User.js";
import { ApiError } from "../utils/errors.js";
import { comparePassword, hashPassword, signToken } from "../utils/auth.js";

export async function registerUser(payload) {
  const existingUser = await User.findOne({ username: payload.username });
  if (existingUser) {
    throw new ApiError(409, "Username is already in use.");
  }

  const user = await User.create({
    username: payload.username,
    password: await hashPassword(payload.password),
    role: payload.role || "USER"
  });

  return {
    token: signToken(user),
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  };
}

export async function loginUser(payload) {
  const user = await User.findOne({ username: payload.username });
  if (!user) {
    throw new ApiError(401, "Invalid username or password.");
  }

  const passwordMatches = await comparePassword(payload.password, user.password);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid username or password.");
  }

  return {
    token: signToken(user),
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  };
}
