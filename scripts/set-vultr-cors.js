const { S3Client, PutBucketCorsCommand } = require("@aws-sdk/client-s3");
require("dotenv").config({ path: ".env.local" });

async function configureCors() {
  const client = new S3Client({
    region: process.env.VULTR_REGION || "ams1",
    endpoint: process.env.VULTR_ENDPOINT || "https://ams1.vultrobjects.com",
    credentials: {
      accessKeyId: process.env.VULTR_ACCESS_KEY,
      secretAccessKey: process.env.VULTR_SECRET_KEY,
    },
    forcePathStyle: false,
  });

  const command = new PutBucketCorsCommand({
    Bucket: process.env.VULTR_BUCKET || "imo-scans",
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: ["*"],
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3600,
        },
      ],
    },
  });

  try {
    await client.send(command);
    console.log("CORS configuration applied successfully to Vultr bucket.");
  } catch (error) {
    console.error("Error applying CORS:", error);
  }
}

configureCors();
