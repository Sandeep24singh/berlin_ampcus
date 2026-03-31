import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid("USER", "MODERATOR").optional()
});

export const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required()
});
