import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { generateAndStoreRefreshToken } from "@/lib/utils/generateTokens";
import { connectDB } from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password, username } = await req.json();

  if (!email || !password)
    return NextResponse.json(
      { msg: "email & password required" },
      { status: 400 }
    );

  const exists = await User.findOne({ email });
  if (exists) return NextResponse.json({ msg: "User exists" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  const usernameSmall = username.toLowerCase();

  const user = await User.create({
    email,
    password: hashed,
    username: usernameSmall,
    role: "member",
  });

  const { refreshToken } = await generateAndStoreRefreshToken(user);

  const res = NextResponse.json({
    msg: "created and logged in",
    user: { id: user._id, email: user.email, username: user.username },
  });

  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return res;
}
