import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["USER", "MODERATOR"],
      default: "USER"
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
