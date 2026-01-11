"use server";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Follow from "@/lib/models/Follow";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await connectDB();
    const { userId } = await requireAuth(req);
    const { username } = await params;

    const targetUser = await User.findOne({ username });
    if (!targetUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (userId === targetUser._id.toString()) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const existing = await Follow.findOne({
      follower: userId,
      following: targetUser._id,
    });

    if (existing) {
      // Unfollow
      await existing.deleteOne();
      await User.findByIdAndUpdate(userId, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(targetUser._id, {
        $inc: { followersCount: -1 },
      });
      return NextResponse.json({ isFollowing: false });
    }

    // Follow
    await Follow.create({ follower: userId, following: targetUser._id });
    await User.findByIdAndUpdate(userId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(targetUser._id, {
      $inc: { followersCount: 1 },
    });

    return NextResponse.json({ isFollowing: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
