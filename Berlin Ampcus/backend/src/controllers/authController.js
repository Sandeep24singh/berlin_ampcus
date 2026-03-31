import { loginSchema, registerSchema } from "../validators/authValidators.js";
import { loginUser, registerUser } from "../services/authService.js";

export async function register(req, res) {
  const payload = await registerSchema.validateAsync(req.body);
  const result = await registerUser(payload);
  return res.status(201).json(result);
}

export async function login(req, res) {
  const payload = await loginSchema.validateAsync(req.body);
  const result = await loginUser(payload);
  return res.status(200).json(result);
}
