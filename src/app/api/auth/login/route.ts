import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import { compare } from "bcrypt-ts";
import { generateAndStoreRefreshToken } from "@/lib/utils/generateTokens";
import { connectDB } from "@/lib/mongoose";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Connect to Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 5 login attempts per 15 minutes per IP
const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
});

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  // -------------------------------
  // Rate limiting check
  // -------------------------------
  const { success } = await limiter.limit(ip.toString());
  if (!success) {
    return NextResponse.json(
      { msg: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  // -------------------------------
  // User login logic
  // -------------------------------
  const user = await User.findOne({ email });
  if (!user || !(await compare(password, user.password))) {
    return NextResponse.json(
      { msg: "Incorrect email or password." },
      { status: 400 }
    );
  }

  const { refreshToken } = await generateAndStoreRefreshToken(user);

  const res = NextResponse.json({
    message: "Login successful",
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });

  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return res;
}
