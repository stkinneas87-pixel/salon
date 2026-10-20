import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathname = path.join("/");

  if (!pathname.startsWith("cms/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse("Media storage is not configured.", { status: 503 });
  }

  try {
    const result = await get(pathname, {
      access: "private",
      token,
    });

    if (!result || result.statusCode !== 200) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Content-Length": String(result.blob.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
