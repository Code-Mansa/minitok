"use server";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth/requireAuth";
import Post from "@/lib/models/Post";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await requireAuth(req);

    const body = await req.json();
    const { type, mediaUrl, thumbnailUrl, caption, duration } = body;

    if (!type || !mediaUrl) {
      return NextResponse.json(
        { msg: "Missing required fields" },
        { status: 400 }
      );
    }

    const post = await Post.create({
      author: userId,
      type,
      mediaUrl,
      thumbnailUrl,
      caption,
      duration,
    });

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 401 });
  }
}
