import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Bookmark from "@/lib/models/Bookmark";
import Post from "@/lib/models/Post";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  await connectDB();

  // 🔑 unwrap async params (Next.js App Router)
  const { postId } = await context.params;

  if (!postId) {
    return NextResponse.json(
      { error: "postId missing in route params" },
      { status: 400 }
    );
  }

  const { userId } = await requireAuth(request);

  const existing = await Bookmark.findOne({
    user: userId,
    post: postId,
  });

  if (existing) {
    await existing.deleteOne();
    await Post.findByIdAndUpdate(postId, {
      $inc: { bookmarkCount: -1 },
    });

    return NextResponse.json({ bookmarked: false });
  }

  await Bookmark.create({
    user: userId,
    post: postId,
  });

  await Post.findByIdAndUpdate(postId, {
    $inc: { bookmarkCount: 1 },
  });

  return NextResponse.json({ bookmarked: true });
}
