"use server";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth/requireAuth";
import Follow from "@/lib/models/Follow";
import Post from "@/lib/models/Post";
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { userId } = await requireAuth(request);

    const userObjectId = new Types.ObjectId(userId);

    const followingDocs = await Follow.find({ follower: userId }).select(
      "following"
    );
    const followingIds = followingDocs.map((doc) => doc.following);

    const posts = await Post.aggregate([
      // 1️⃣ Join author
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },

      // 2️⃣ Lookup likes by THIS user
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

      // 3️⃣ Lookup bookmarks by THIS user
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

      // 4️⃣ Project safe fields + normalize
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

          followingBoost: {
            $cond: [{ $in: ["$author._id", followingIds] }, 20, 0],
          },

          recencyBoost: {
            $divide: [
              1,
              {
                $add: [
                  {
                    $divide: [
                      { $subtract: [new Date(), "$createdAt"] },
                      1000 * 60 * 60,
                    ],
                  },
                  1,
                ],
              },
            ],
          },
        },
      },

      // 5️⃣ Score
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$likesCount", 3] },
              { $multiply: ["$commentsCount", 4] },
              "$viewsCount",
              "$recencyBoost",
              "$followingBoost",
            ],
          },
        },
      },

      // 6️⃣ Sort + limit
      { $sort: { score: -1 } },
      { $limit: 20 },

      // 7️⃣ Cleanup
      {
        $project: {
          followingBoost: 0,
          recencyBoost: 0,
          score: 0,
        },
      },
    ]);

    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error("For You feed error:", err);
    return NextResponse.json(
      { msg: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
