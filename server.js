const express = require("express");
const AWS = require("aws-sdk");
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));

require("dotenv").config();

// Backblaze B2 S3-Compatible API Configuration
const B2_ENDPOINT = process.env.B2_ENDPOINT || "s3.us-west-004.backblazeb2.com";

const s3 = new AWS.S3({
  endpoint: `https://${B2_ENDPOINT}`,
  accessKeyId: process.env.B2_APPLICATION_KEY_ID,
  secretAccessKey: process.env.B2_APPLICATION_KEY,
  s3ForcePathStyle: true, // Required for B2
  signatureVersion: "v4",
});

const BUCKET_NAME = process.env.B2_BUCKET_NAME;

console.log("Using Backblaze B2 Storage");
console.log("Endpoint:", B2_ENDPOINT);
console.log("Bucket:", BUCKET_NAME);

const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    console.log("No file received in request");
    return res.status(400).send("No file uploaded");
  }

  console.log(
    "Uploading file:",
    req.file.originalname,
    "Size:",
    req.file.size,
    "bytes",
  );

  const params = {
    Bucket: BUCKET_NAME,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Upload error:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      return res.status(500).json({
        error: "Upload failed",
        message: err.message,
        code: err.code,
      });
    }
    console.log("File uploaded successfully:", data.Key);
    console.log("File location:", data.Location);
    res.send("File uploaded successfully!");
  });
});

app.get("/files", (req, res) => {
  console.log("Fetching files from bucket:", BUCKET_NAME);

  s3.listObjectsV2({ Bucket: BUCKET_NAME }, (err, data) => {
    if (err) {
      console.error("List files error:", err);
      console.error("Error details:", JSON.stringify(err, null, 2));
      return res.status(500).json({
        error: "Error listing files",
        message: err.message,
        code: err.code,
      });
    }

    console.log("Files found:", data.Contents ? data.Contents.length : 0);

    if (!data.Contents || data.Contents.length === 0) {
      return res.json([]);
    }

    const files = data.Contents.map((obj) => {
      const presignedUrl = s3.getSignedUrl("getObject", {
        Bucket: BUCKET_NAME,
        Key: obj.Key,
        Expires: 3600,
      });

      return {
        name: obj.Key,
        url: presignedUrl,
        size: obj.Size,
        lastModified: obj.LastModified,
      };
    });

    res.json(files);
  });
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log("Generating download URL for:", filename);

  const params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Expires: 3600,
  };

  const url = s3.getSignedUrl("getObject", params);
  res.json({ url: url, filename: filename });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
