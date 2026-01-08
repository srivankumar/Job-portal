import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
  endpoint: process.env.WASABI_ENDPOINT,
  region: process.env.WASABI_REGION,
  s3ForcePathStyle: true,
  signatureVersion: "v4"
});

/* =========================
   UPLOAD RESUME (PRIVATE)
========================= */
export const uploadToWasabi = async (file, userId, jobId) => {
  const timestamp = Date.now();
  const key = `resumes/${userId}_${jobId}_${timestamp}.pdf`;

  const params = {
    Bucket: process.env.WASABI_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: "application/pdf"
    // ❌ NO ACL
  };

  try {
    await s3.putObject(params).promise();
    return { key, timestamp };
  } catch (error) {
    console.error("Wasabi upload error:", error);
    throw new Error("Upload failed");
  }
};

/* =========================
   GET PRESIGNED DOWNLOAD URL
========================= */
export const getResumeUrl = (key) => {
  if (!key) {
    return null;
  }

  const params = {
    Bucket: process.env.WASABI_BUCKET,
    Key: key,
    Expires: 3600, // 1 hour
    ResponseContentDisposition: "inline"
  };

  try {
    return s3.getSignedUrl("getObject", params);
  } catch (error) {
    console.error("Wasabi presign error:", error);
    return null;
  }
};
