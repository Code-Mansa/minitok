"use server";

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireEnv } from "@/lib/utils/requireEnv";

cloudinary.config({
  cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: requireEnv("CLOUDINARY_API_KEY"),
  api_secret: requireEnv("CLOUDINARY_API_SECRET"),
});

export async function POST(req: NextRequest) {
  const { type } = await req.json();

  if (!type || !["image", "video", "avatar"].includes(type)) {
    return NextResponse.json({ msg: "Invalid media type" }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Set folder based on type
  const folder = type === "avatar" ? "avatars" : `posts/${type}s`;

  const paramsToSign = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    requireEnv("CLOUDINARY_API_SECRET")
  );

  return NextResponse.json({
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    timestamp,
    folder,
    signature,
    resourceType: type === "avatar" ? "image" : type, // avatar is image resource type
  });
}
