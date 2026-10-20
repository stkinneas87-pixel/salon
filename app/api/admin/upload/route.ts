import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { assertAdmin } from "@/lib/auth/session";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  await assertAdmin();

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "BLOB_READ_WRITE_TOKEN is not configured. Create a Vercel Blob store and add the token.",
      },
      { status: 500 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image was provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Use a JPEG, PNG or WebP image." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "The image is too large. Please use one under 4MB." },
        { status: 400 },
      );
    }

    const extension =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const access =
      process.env.BLOB_ACCESS === "public" ? "public" : "private";
    const blob = await put(
      `cms/${randomUUID()}.${extension}`,
      file,
      {
        access,
        addRandomSuffix: true,
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      },
    );

    return NextResponse.json({
      url: access === "public" ? blob.url : `/api/media/${blob.pathname}`,
    });
  } catch (error) {
    console.error("Image upload failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The image could not be uploaded.",
      },
      { status: 400 },
    );
  }
}
