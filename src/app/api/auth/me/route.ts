"use server";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/lib/models/User";
import RefreshToken from "@/lib/models/RefreshToken";
import { connectDB } from "@/lib/mongoose";
import { requireEnv } from "@/lib/utils/requireEnv";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function GET(req: NextRequest) {
  await connectDB();

  const token = req.cookies.get("refreshToken")?.value;
  if (!token)
    return NextResponse.json({ msg: "Not authenticated" }, { status: 401 });

  let payload: any;
  try {
    payload = jwt.verify(token, requireEnv("REFRESH_TOKEN_SECRET"));
  } catch {
    return NextResponse.json({ msg: "Invalid token" }, { status: 401 });
  }

  if (typeof payload === "string")
    return NextResponse.json({ msg: "Invalid token" }, { status: 401 });

  const refreshDoc = await RefreshToken.findOne({ tokenId: payload.tokenId });
  if (!refreshDoc || refreshDoc.expiresAt < new Date()) {
    return NextResponse.json({ msg: "Session expired" }, { status: 401 });
  }

  // Optional: ensure JWT id matches stored refresh token
  if (refreshDoc.userId.toString() !== payload.id) {
    return NextResponse.json({ msg: "Token user mismatch" }, { status: 401 });
  }

  const user = await User.findById(payload.id).select("-password");
  if (!user)
    return NextResponse.json({ msg: "User not found" }, { status: 404 });

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      website: user.website,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      likesCount: user.likesCount,
      isVerified: user.isVerified,
      role: user.role,
    },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await requireAuth(req);
    const body = await req.json();

    const updates: any = {};
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.website !== undefined) updates.website = body.website;
    if (body.avatar !== undefined) updates.avatar = body.avatar;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    })
      .select(
        "username avatar bio website followersCount followingCount likesCount"
      )
      .lean();

    return NextResponse.json(updatedUser);
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
