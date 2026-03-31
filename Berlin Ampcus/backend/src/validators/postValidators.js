import Joi from "joi";

export const createPostSchema = Joi.object({
  textContent: Joi.string().allow("").max(5000).required()
}).custom((value, helpers) => {
  if (!value.textContent.trim()) {
    return helpers.error("any.invalid", { message: "Text content cannot be empty." });
  }
  return value;
});

export const moderationResolveSchema = Joi.object({
  action: Joi.string().valid("APPROVE", "REJECT").required()
});
