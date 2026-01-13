import mongoose from "mongoose";

const viewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      index: true,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate views
viewSchema.index({ user: 1, post: 1 }, { unique: true });

export default mongoose.models.View || mongoose.model("View", viewSchema);
