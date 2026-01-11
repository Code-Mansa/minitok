import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth/requireAuth";
import Follow from "@/lib/models/Follow";
import User from "@/lib/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const search = searchParams.get("search")?.trim() || "";

    // Base query: users you follow
    const match: any = { follower: userId };

    if (search) {
      // Search by username (case-insensitive)
      const users = await User.find({
        username: { $regex: search, $options: "i" },
      })
        .select("_id")
        .lean();

      const userIds = users.map((u) => u._id);
      match.following = { $in: userIds };
    }

    const follows = await Follow.find(match)
      .sort({ createdAt: -1 }) // most recent follows first
      .limit(limit)
      .populate("following", "username avatar")
      .lean();

    const followingUsers = follows.map((f) => ({
      id: f.following._id.toString(),
      username: f.following.username,
      avatar: f.following.avatar || "/avatar/default.jpg",
    }));

    return NextResponse.json({ users: followingUsers });
  } catch (err) {
    console.error("Following users error:", err);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}
