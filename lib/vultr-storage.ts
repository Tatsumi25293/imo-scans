import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Vultr Object Storage is S3-compatible
export const vultrS3 = new S3Client({
  region: process.env.VULTR_REGION || "ams1",
  endpoint: process.env.VULTR_ENDPOINT || "https://ams1.vultrobjects.com",
  credentials: {
    accessKeyId: process.env.VULTR_ACCESS_KEY!,
    secretAccessKey: process.env.VULTR_SECRET_KEY!,
  },
  forcePathStyle: false, // Vultr uses virtual-hosted-style
});

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

  await vultrS3.send(command);
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
  await vultrS3.send(command);
}

/**
 * Extract the key from a Vultr public URL
 */
export function getKeyFromUrl(url: string): string {
  return url.replace(`${CDN_URL}/`, "");
}
