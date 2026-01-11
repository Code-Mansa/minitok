import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import User from "@/lib/models/User";
import Follow from "@/lib/models/Follow";
import { requireAuth } from "@/lib/auth/requireAuth";
import { Types } from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connectDB();

    // ✅ ALWAYS unwrap params first
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // ✅ Auth AFTER params
    const auth = await requireAuth(req).catch(() => null);
    const userId = auth?.userId ?? null;

    const currentUserObjectId =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : null;

    const profileUser = await User.findOne({ username }).lean();

    if (!profileUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let isFollowing = false;
    if (currentUserObjectId) {
      isFollowing = await Follow.exists({
        follower: currentUserObjectId,
        following: profileUser._id,
      });
    }

    const isMe = currentUserObjectId?.toString() === profileUser._id.toString();

    return NextResponse.json({
      _id: profileUser._id.toString(),
      username: profileUser.username,
      avatar: profileUser.avatar ?? null,
      bio: profileUser.bio ?? "",
      website: profileUser.website ?? "",
      followersCount: profileUser.followersCount ?? 0,
      followingCount: profileUser.followingCount ?? 0,
      likesCount: profileUser.likesCount ?? 0,
      isMe,
      isFollowing,
    });
  } catch (err) {
    console.error("Profile route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
