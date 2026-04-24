// Test script to diagnose S3 connection issues
require("dotenv").config();
const AWS = require("aws-sdk");

console.log("=== AWS Configuration Test ===\n");

// Check environment variables
console.log("1. Environment Variables:");
console.log("   AWS_REGION:", process.env.AWS_REGION);
console.log(
  "   AWS_ACCESS_KEY_ID:",
  process.env.AWS_ACCESS_KEY_ID
    ? "✓ Set (starts with " +
        process.env.AWS_ACCESS_KEY_ID.substring(0, 10) +
        "...)"
    : "✗ Not set"
);
console.log(
  "   AWS_SECRET_ACCESS_KEY:",
  process.env.AWS_SECRET_ACCESS_KEY ? "✓ Set" : "✗ Not set"
);
console.log();

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const BUCKET_NAME = "awsccritdemo";

console.log("2. Bucket Name:", BUCKET_NAME);
console.log();

// Test 1: List buckets (to verify credentials)
console.log("3. Testing AWS Credentials (listing all buckets)...");
s3.listBuckets((err, data) => {
  if (err) {
    console.error("   ✗ FAILED - Credentials issue!");
    console.error("   Error:", err.message);
    console.error("   Code:", err.code);
  } else {
    console.log("   ✓ SUCCESS - Credentials are valid");
    console.log("   Your buckets:", data.Buckets.map((b) => b.Name).join(", "));
  }
  console.log();

  // Test 2: List objects in the specific bucket
  console.log("4. Testing Bucket Access (listing files in awsccritdemo)...");
  s3.listObjectsV2({ Bucket: BUCKET_NAME }, (err, data) => {
    if (err) {
      console.error("   ✗ FAILED - Cannot access bucket!");
      console.error("   Error:", err.message);
      console.error("   Code:", err.code);
      console.error();
      console.error("   Possible issues:");
      console.error("   - Bucket doesn't exist");
      console.error("   - Bucket is in a different region");
      console.error("   - IAM user lacks permissions");
      console.error("   - Bucket name is incorrect");
    } else {
      console.log("   ✓ SUCCESS - Can access bucket");
      console.log(
        "   Files in bucket:",
        data.Contents ? data.Contents.length : 0
      );
      if (data.Contents && data.Contents.length > 0) {
        console.log("   File list:");
        data.Contents.forEach((obj) => {
          console.log("     -", obj.Key, `(${obj.Size} bytes)`);
        });
      }
    }
    console.log();

    // Test 3: Check bucket location
    console.log("5. Checking Bucket Region...");
    s3.getBucketLocation({ Bucket: BUCKET_NAME }, (err, data) => {
      if (err) {
        console.error("   ✗ FAILED -", err.message);
      } else {
        const region = data.LocationConstraint || "us-east-1";
        console.log("   ✓ Bucket Region:", region);
        console.log("   Your Config Region:", process.env.AWS_REGION);
        if (region !== process.env.AWS_REGION) {
          console.log("   ⚠️  WARNING: Region mismatch!");
          console.log("   Update your .env file: AWS_REGION=" + region);
        }
      }
      console.log();
      console.log("=== Test Complete ===");
    });
  });
});
