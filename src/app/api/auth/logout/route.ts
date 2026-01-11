import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import RefreshToken from "@/lib/models/RefreshToken";
import { connectDB } from "@/lib/mongoose";
import { requireEnv } from "@/lib/utils/requireEnv";

export async function POST(req: NextRequest) {
  await connectDB();
  const token = req.cookies.get("refreshToken")?.value;

  if (token) {
    try {
      const payload = jwt.verify(
        token,
        requireEnv("REFRESH_TOKEN_SECRET")
      ) as any;
      await RefreshToken.deleteOne({ tokenId: payload.tokenId });
    } catch {}
  }

  const res = NextResponse.json({ msg: "logged out" });
  res.cookies.delete("refreshToken");
  return res;
}
