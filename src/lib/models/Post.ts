import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["video", "image"],
      required: true,
    },

    mediaUrl: { type: String, required: true },
    thumbnailUrl: { type: String }, // for video feeds

    caption: { type: String, maxlength: 2200 },

    duration: { type: Number }, // seconds (video only)

    viewsCount: { type: Number, default: 0 },
    bookmarkCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },

    isPrivate: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likesCount: -1 });
postSchema.index({ viewsCount: -1 });

export default mongoose.models.Post || mongoose.model("Post", postSchema);
