import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import CommentLike from "@/lib/models/CommentLike"; // create this model
import Comment from "@/lib/models/Comment";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  await connectDB();
  const { commentId } = await params;
  const { userId } = await requireAuth(req);

  const existing = await CommentLike.findOne({
    user: userId,
    comment: commentId,
  });

  if (existing) {
    await existing.deleteOne();
    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });
    return NextResponse.json({ liked: false });
  }

  await CommentLike.create({ user: userId, comment: commentId });
  await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });

  return NextResponse.json({ liked: true });
}
