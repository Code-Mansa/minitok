import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },

    role: {
      type: String,
      enum: ["admin", "member", "developer"],
      default: "member",
      required: true,
    },

    // ---- TikTok profile fields ----
    avatar: { type: String }, // image URL
    bio: { type: String, maxlength: 150 },
    website: { type: String },

    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
