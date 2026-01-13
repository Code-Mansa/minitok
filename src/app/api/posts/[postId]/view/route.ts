import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Post from "@/lib/models/Post";
import View from "@/lib/models/View";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  await connectDB();

  const { postId } = await context.params;

  if (!postId) {
    return NextResponse.json({ error: "postId missing" }, { status: 400 });
  }

  const { userId } = await requireAuth(request);

  // Check if this user already viewed this post
  const existing = await View.findOne({ user: userId, post: postId });
  if (existing) {
    // Already counted → return current views count
    const post = await Post.findById(postId);
    return NextResponse.json({ viewsCount: post?.viewsCount ?? 0 });
  }

  // Create a new view
  await View.create({ user: userId, post: postId });

  // Increment the viewsCount in Post
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $inc: { viewsCount: 1 } },
    { new: true }
  );

  return NextResponse.json({ viewsCount: updatedPost?.viewsCount ?? 0 });
}
