"use server";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth/requireAuth";
import Follow from "@/lib/models/Follow";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await requireAuth(req);

    // Convert userId to ObjectId immediately
    const userObjectId = new Types.ObjectId(userId);

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit")) || 10;

    // Build exclusion list: self + all followed users (all as ObjectId)
    const followed = await Follow.find({ follower: userObjectId }).select(
      "following"
    );
    const excludeIds: Types.ObjectId[] = [
      userObjectId, // self
      ...followed.map((f) => f.following), // already ObjectId
    ];

    // Helper to safely add new IDs (prevents duplicates)
    const addToExclude = (newIds: string[] | Types.ObjectId[]) => {
      newIds.forEach((rawId) => {
        const objId =
          typeof rawId === "string" ? new Types.ObjectId(rawId) : rawId;
        if (!excludeIds.some((eid) => eid.equals(objId))) {
          excludeIds.push(objId);
        }
      });
    };

    // 1. Mutual follows (highest priority)
    const mutual = await Follow.aggregate([
      { $match: { follower: userObjectId } },
      {
        $lookup: {
          from: "follows",
          let: { followingId: "$following" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$following", "$$followingId"] },
                    { $eq: ["$follower", userObjectId] },
                  ],
                },
              },
            },
          ],
          as: "reverse",
        },
      },
      { $match: { reverse: { $ne: [] } } },
      { $limit: Math.ceil(limit / 2) },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          id: "$user._id",
          username: "$user.username",
          avatar: "$user.avatar",
          score: 10,
        },
      },
    ]);

    addToExclude(mutual.map((m) => m.id)); // m.id is already ObjectId

    // 2. Common followers
    const common = await Follow.aggregate([
      { $match: { follower: userObjectId } },
      {
        $lookup: {
          from: "follows",
          localField: "following",
          foreignField: "following",
          as: "followers",
        },
      },
      { $unwind: "$followers" },
      {
        $match: {
          "followers.follower": {
            $ne: userObjectId,
            $nin: excludeIds,
          },
        },
      },
      {
        $group: {
          _id: "$followers.follower",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          id: "$user._id",
          username: "$user.username",
          avatar: "$user.avatar",
          score: "$count",
        },
      },
    ]);

    addToExclude(common.map((c) => c.id));

    // 3. Recently active users
    const recent = await Post.aggregate([
      {
        $group: {
          _id: "$author",
          lastActive: { $max: "$createdAt" },
        },
      },
      { $match: { _id: { $nin: excludeIds } } },
      { $sort: { lastActive: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          id: "$user._id",
          username: "$user.username",
          avatar: "$user.avatar",
          score: 1,
        },
      },
    ]);

    addToExclude(recent.map((r) => r.id));

    // 4. Combine, dedupe, sort
    const combined = [...mutual, ...common, ...recent];
    const uniqueMap = new Map<string, any>();

    combined.forEach((u) => {
      const id = u.id.toString();
      if (!uniqueMap.has(id)) uniqueMap.set(id, u);
    });

    let suggestedUsers = Array.from(uniqueMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((u) => ({
        id: u.id.toString(),
        username: u.username,
        avatar: u.avatar || "/avatar/default.jpg",
      }));

    // 5. HARD FALLBACK — random users (guaranteed no followed)
    if (suggestedUsers.length === 0) {
      const randomUsers = await User.aggregate([
        { $match: { _id: { $nin: excludeIds } } }, // exclusion applied here
        { $sample: { size: limit } },
        {
          $project: {
            id: "$_id",
            username: 1,
            avatar: 1,
          },
        },
      ]);

      suggestedUsers = randomUsers.map((u) => ({
        id: u.id.toString(),
        username: u.username,
        avatar: u.avatar || "/avatar/default.jpg",
      }));
    }

    return NextResponse.json({ suggested: suggestedUsers });
  } catch (err) {
    console.error("Suggested users error:", err);
    return NextResponse.json({ suggested: [] });
  }
}
