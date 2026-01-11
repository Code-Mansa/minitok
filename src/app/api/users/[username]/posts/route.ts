// app/api/users/[username]/posts/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import Bookmark from "@/lib/models/Bookmark"; // make sure you have this
import Like from "@/lib/models/Like";
import { requireAuth } from "@/lib/auth/requireAuth";
import { Types } from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await connectDB();
    const { username } = await params;
    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "posts";

    const { userId } = await requireAuth(req);
    const currentUserObjectId = userId ? new Types.ObjectId(userId) : null;

    const targetUser = await User.findOne({ username });
    if (!targetUser) return NextResponse.json({ posts: [] });

    const targetUserId = targetUser._id;

    const isOwnProfile =
      currentUserObjectId && currentUserObjectId.equals(targetUserId);

    let posts: any[] = [];

    if (tab === "bookmarks" || tab === "likes") {
      if (!isOwnProfile) {
        return NextResponse.json({ posts: [] });
      }

      const Model = tab === "bookmarks" ? Bookmark : Like;

      // Start from the interaction collection
      const interactions = await Model.find({ user: currentUserObjectId })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("post")
        .lean();

      const postIds = interactions.map((i) => i.post);

      if (postIds.length === 0) {
        return NextResponse.json({ posts: [] });
      }

      // Now fetch the actual posts
      posts = await Post.find({ _id: { $in: postIds } })
        .sort({ createdAt: -1 })
        .select(
          "type mediaUrl thumbnailUrl likesCount commentsCount viewsCount createdAt"
        )
        .lean();
    } else {
      // Regular posts/clips
      const match: any = { author: targetUserId };

      if (tab === "clips") match.type = "video";
      if (tab === "posts") match.type = "image";

      posts = await Post.find(match)
        .sort({ createdAt: -1 })
        .limit(50)
        .select(
          "type mediaUrl thumbnailUrl likesCount commentsCount viewsCount createdAt"
        )
        .lean();
    }

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Profile posts error:", err);
    return NextResponse.json({ posts: [] });
  }
}
