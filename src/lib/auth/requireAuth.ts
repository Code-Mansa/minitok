import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import RefreshToken from "@/lib/models/RefreshToken";
import { requireEnv } from "@/lib/utils/requireEnv";

export async function requireAuth(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value;
  if (!token) throw new Error("NOT_AUTHENTICATED");

  let payload: any;
  try {
    payload = jwt.verify(token, requireEnv("REFRESH_TOKEN_SECRET"));
  } catch {
    throw new Error("INVALID_TOKEN");
  }

  if (typeof payload === "string") {
    throw new Error("INVALID_TOKEN");
  }

  const refreshDoc = await RefreshToken.findOne({
    tokenId: payload.tokenId,
  });

  if (!refreshDoc || refreshDoc.expiresAt < new Date()) {
    throw new Error("SESSION_EXPIRED");
  }

  if (refreshDoc.userId.toString() !== payload.id) {
    throw new Error("TOKEN_MISMATCH");
  }

  return {
    userId: payload.id,
  };
}
