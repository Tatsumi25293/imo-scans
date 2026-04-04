/**
 * Script to configure Vultr Object Storage:
 * 1. Set bucket to public-read
 * 2. Configure CORS for web access
 * Run: node scripts/setup-vultr-bucket.mjs
 */

import { S3Client, PutBucketPolicyCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "ams1",
  endpoint: "https://ams1.vultrobjects.com",
  credentials: {
    accessKeyId: "4T1M89ERISA1KS82M9CK",
    secretAccessKey: "bGOzXg8OW1jdwF8truZpdeD87SsQ3p3yC534PwXl",
  },
  forcePathStyle: false,
});

const BUCKET = "imo-scans";

// 1. Set bucket policy to allow public read for all objects
const publicPolicy = {
  Version: "2012-10-17",
  Statement: [
    {
      Sid: "PublicReadGetObject",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${BUCKET}/*`,
    },
  ],
};

// 2. Set CORS configuration
const corsConfig = {
  CORSRules: [
    {
      AllowedHeaders: ["*"],
      AllowedMethods: ["GET", "HEAD"],
      AllowedOrigins: ["*"],
      ExposeHeaders: ["ETag"],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function setup() {
  console.log("🚀 Setting up Vultr Object Storage...\n");

  // Set bucket policy
  try {
    await client.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET,
        Policy: JSON.stringify(publicPolicy),
      })
    );
    console.log("✅ Bucket policy set to public-read successfully");
  } catch (err) {
    console.error("❌ Failed to set bucket policy:", err.message);
  }

  // Set CORS
  try {
    await client.send(
      new PutBucketCorsCommand({
        Bucket: BUCKET,
        CORSConfiguration: corsConfig,
      })
    );
    console.log("✅ CORS configuration set successfully");
  } catch (err) {
    console.error("❌ Failed to set CORS:", err.message);
  }

  console.log("\n✨ Done! Bucket is now configured for public web access.");
  console.log(`📦 Public URL: https://${BUCKET}.ams1.vultrobjects.com/your-file.jpg`);
}

setup();
