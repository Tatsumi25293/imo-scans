import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _s3Client: S3Client | null = null;

export function getVultrClient(): S3Client {
  if (_s3Client) return _s3Client;

  if (!process.env.VULTR_ACCESS_KEY || !process.env.VULTR_SECRET_KEY) {
    console.error("Vultr Keys missing:", { access: !!process.env.VULTR_ACCESS_KEY, secret: !!process.env.VULTR_SECRET_KEY });
    throw new Error("مفاتيح Vultr غير موجودة. يرجى إغلاق الخادم بالكامل، والتأكد من ملف .env.local، ثم إعادة تشغيله.");
  }

  _s3Client = new S3Client({
    region: process.env.VULTR_REGION || "ams1",
    endpoint: process.env.VULTR_ENDPOINT || "https://ams1.vultrobjects.com",
    credentials: {
      accessKeyId: process.env.VULTR_ACCESS_KEY,
      secretAccessKey: process.env.VULTR_SECRET_KEY,
    },
    forcePathStyle: false, // Vultr uses virtual-hosted-style
  });

  return _s3Client;
}

export async function generateVultrPresignedUrl(key: string, contentType: string): Promise<string> {
  const bucket = process.env.VULTR_BUCKET || "imo-scans";
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });
  
  const client = getVultrClient();
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

const BUCKET = process.env.VULTR_BUCKET || "imo-scans";
const CDN_URL = process.env.NEXT_PUBLIC_VULTR_CDN_URL || "https://imo-scans.ams1.vultrobjects.com";

/**
 * Upload a file buffer to Vultr object storage
 * Returns the public URL.
 */
export async function uploadToVultr(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: "public-read",
  });

  const client = getVultrClient();
  await client.send(command);
  return `${CDN_URL}/${key}`;
}

/**
 * Delete a file from Vultr object storage
 */
export async function deleteFromVultr(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  const client = getVultrClient();
  await client.send(command);
}

/**
 * Extract the key from a Vultr public URL
 */
export function getKeyFromUrl(url: string): string {
  return url.replace(`${CDN_URL}/`, "");
}
