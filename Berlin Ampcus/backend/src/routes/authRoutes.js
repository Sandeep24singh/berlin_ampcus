import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { login, register } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
