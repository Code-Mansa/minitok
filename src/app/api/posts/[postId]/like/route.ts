import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Like from "@/lib/models/Like";
import Post from "@/lib/models/Post";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  await connectDB();

  // 🔑 UNWRAP params
  const { postId } = await context.params;

  if (!postId) {
    return NextResponse.json(
      { error: "postId missing in route params" },
      { status: 400 }
    );
  }

  const { userId } = await requireAuth(request);

  const existing = await Like.findOne({
    user: userId,
    post: postId,
  });

  if (existing) {
    await existing.deleteOne();
    await Post.findByIdAndUpdate(postId, {
      $inc: { likesCount: -1 },
    });

    return NextResponse.json({ liked: false });
  }

  await Like.create({
    user: userId,
    post: postId,
  });

  await Post.findByIdAndUpdate(postId, {
    $inc: { likesCount: 1 },
  });

  return NextResponse.json({ liked: true });
}
