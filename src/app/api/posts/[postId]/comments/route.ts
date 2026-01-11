// app/api/posts/[postId]/comments/route.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Comment from "@/lib/models/Comment";
import Post from "@/lib/models/Post";
import { requireAuth } from "@/lib/auth/requireAuth";
import { Types } from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connectDB();
    const { postId } = await params;
    const { userId } = await requireAuth(req);
    const { text, parent } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Comment text required" },
        { status: 400 }
      );
    }

    const comment = await Comment.create({
      post: postId,
      author: userId,
      text: text.trim(),
      parent: parent ? new Types.ObjectId(parent) : null,
    });

    await comment.populate("author", "username avatar");

    // Increment commentsCount on post
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    return NextResponse.json({ comment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connectDB();
    const { postId } = await params;
    const { userId } = await requireAuth(req);

    const userObjectId = new Types.ObjectId(userId);

    const comments = await Comment.aggregate([
      { $match: { post: new Types.ObjectId(postId), parent: null } }, // top-level only
      { $sort: { createdAt: -1 } },

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

      // Check if current user liked this comment
      {
        $lookup: {
          from: "commentlikes", // you'll create this collection
          let: { commentId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$comment", "$$commentId"] },
                    { $eq: ["$user", userObjectId] },
                  ],
                },
              },
            },
          ],
          as: "likedByMe",
        },
      },

      {
        $project: {
          text: 1,
          createdAt: 1,
          likesCount: 1,
          author: {
            _id: "$author._id",
            username: "$author.username",
            avatar: "$author.avatar",
          },
          likedByMe: { $gt: [{ $size: "$likedByMe" }, 0] },
        },
      },
    ]);

    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}
