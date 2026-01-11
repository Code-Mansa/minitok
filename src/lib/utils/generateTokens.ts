import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import RefreshToken from "../models/RefreshToken";
import { requireEnv } from "./requireEnv";

const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

function msFromDuration(duration: string): number {
  const m = duration.match(/^(\d+)([smhd])$/);
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  switch (m[2]) {
    case "s":
      return n * 1000;
    case "m":
      return n * 60 * 1000;
    case "h":
      return n * 60 * 60 * 1000;
    case "d":
      return n * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export async function generateAndStoreRefreshToken(
  user: any,
  { userAgent = "", ip = "" } = {}
) {
  const tokenId = uuidv4();
  const expiresAt = new Date(Date.now() + msFromDuration(REFRESH_EXPIRES));

  await RefreshToken.create({
    tokenId,
    userId: user._id,
    expiresAt,
    userAgent,
    ip,
  });

  const refreshToken = jwt.sign(
    { tokenId, id: user._id.toString() },
    requireEnv("REFRESH_TOKEN_SECRET"),
    { expiresIn: REFRESH_EXPIRES }
  );

  return { refreshToken, tokenId };
}
