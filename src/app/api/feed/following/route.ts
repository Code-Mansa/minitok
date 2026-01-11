"use server";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth/requireAuth";
import Follow from "@/lib/models/Follow";
import Post from "@/lib/models/Post";
import { Types } from "mongoose"; // ← Add this

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { userId } = await requireAuth(req);

    const userObjectId = new Types.ObjectId(userId); // ← Convert to ObjectId

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 10;
    const cursor = searchParams.get("cursor");

    // Get followed users
    const followingDocs = await Follow.find({ follower: userId }).select(
      "following"
    );
    const followingIds = followingDocs.map((doc) => doc.following);

    if (followingIds.length === 0) {
      return NextResponse.json({ posts: [], nextCursor: null });
    }

    // Build base match
    const match: any = {
      author: { $in: followingIds },
    };

    if (cursor) {
      match.createdAt = { $lt: new Date(cursor) };
    }

    const posts = await Post.aggregate([
      { $match: match },

      // Sort early for performance
      { $sort: { createdAt: -1 } },

      // Limit +1 for cursor
      { $limit: limit + 1 },

      // Join author
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },

      // Lookup likes by current user
      {
        $lookup: {
          from: "likes",
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$post", "$$postId"] },
                    { $eq: ["$user", userObjectId] },
                  ],
                },
              },
            },
          ],
          as: "likedByMe",
        },
      },

      // Lookup bookmarks by current user
      {
        $lookup: {
          from: "bookmarks",
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$post", "$$postId"] },
                    { $eq: ["$user", userObjectId] },
                  ],
                },
              },
            },
          ],
          as: "bookmarkedByMe",
        },
      },

      // Project final fields
      {
        $project: {
          type: 1,
          mediaUrl: 1,
          thumbnailUrl: 1,
          caption: 1,
          duration: 1,
          viewsCount: { $ifNull: ["$viewsCount", 0] },
          likesCount: { $ifNull: ["$likesCount", 0] },
          commentsCount: { $ifNull: ["$commentsCount", 0] },
          bookmarkCount: { $ifNull: ["$bookmarkCount", 0] },
          sharesCount: { $ifNull: ["$sharesCount", 0] },
          createdAt: 1,

          author: {
            _id: "$author._id",
            username: "$author.username",
            avatar: "$author.avatar",
          },

          likedByMe: { $gt: [{ $size: "$likedByMe" }, 0] },
          bookmarkedByMe: { $gt: [{ $size: "$bookmarkedByMe" }, 0] },
        },
      },
    ]);

    const hasNextPage = posts.length > limit;
    const data = hasNextPage ? posts.slice(0, limit) : posts;
    const nextCursor = hasNextPage ? data[data.length - 1].createdAt : null;

    return NextResponse.json({
      posts: data,
      nextCursor,
    });
  } catch (err: any) {
    console.error("Following feed error:", err);
    return NextResponse.json(
      { msg: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
