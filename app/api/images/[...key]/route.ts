import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.VULTR_BUCKET || "imoscans";

let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (_s3Client) return _s3Client;

  if (!process.env.VULTR_ACCESS_KEY || !process.env.VULTR_SECRET_KEY) {
    throw new Error("S3 Credentials are not configured in environment variables.");
  }

  _s3Client = new S3Client({
    region: process.env.VULTR_REGION || "eu-central-2",
    endpoint: process.env.VULTR_ENDPOINT || "https://eu-central-2.storage.jetbackup.com",
    credentials: {
      accessKeyId: process.env.VULTR_ACCESS_KEY,
      secretAccessKey: process.env.VULTR_SECRET_KEY,
    },
    forcePathStyle: true, // Path-style is more compatible with non-AWS S3
  });

  return _s3Client;
}

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    if (!keyParts || keyParts.length === 0) {
      return new NextResponse("Missing image key", { status: 400 });
    }

    const key = keyParts.join("/");
    const client = getS3Client();

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const s3Response = await client.send(command);

    if (!s3Response.Body) {
      return new NextResponse("Image body is empty", { status: 404 });
    }

    const arrayBuffer = await s3Response.Body.transformToByteArray();
    const contentType = s3Response.ContentType || "image/jpeg";
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("Proxy image error:", err);
    if (err.name === "NoSuchKey") {
      return new NextResponse("Image Not Found", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
