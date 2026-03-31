import mongoose from "mongoose";

const moderationAuditSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    textContent: {
      type: String,
      default: "",
      maxlength: 5000
    },
    imageUrl: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "FLAGGED", "REJECTED"],
      default: "PENDING"
    },
    flags: {
      type: [String],
      default: []
    },
    confidenceScores: {
      toxicity: { type: Number, default: 0 },
      misinformation: { type: Number, default: 0 },
      nsfw: { type: Number, default: 0 },
      overall: { type: Number, default: 0 }
    },
    moderationReasons: {
      type: [String],
      default: []
    },
    mlNotes: {
      type: [String],
      default: []
    },
    failureCount: {
      type: Number,
      default: 0
    },
    lastModeratedAt: Date,
    moderationAuditLog: {
      type: [moderationAuditSchema],
      default: []
    }
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
