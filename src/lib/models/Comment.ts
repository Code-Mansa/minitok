// models/Comment.ts
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      index: true,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, maxlength: 500, required: true, trim: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for efficient fetching
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parent: 1, createdAt: -1 });

export default mongoose.models.Comment ||
  mongoose.model("Comment", commentSchema);
