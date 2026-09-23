import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3client from "./s3client.js";

export const deleteFromS3 = async (fileUrl) => {
  try {
    let Key;

    // Check if fileUrl is a full URL
    if (fileUrl && fileUrl.startsWith("http")) {
      const parsedUrl = new URL(fileUrl);
      const host = parsedUrl.host;
      const bucketHost = `${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com`;
      const cdnHost = process.env.SPACES_CDN_URL
        ? new URL(process.env.SPACES_CDN_URL).host
        : null;
      // Skip delete for external video URLs (not our Spaces/CDN)
      if (host !== bucketHost && host !== cdnHost) return;
      Key = parsedUrl.pathname.slice(1);
    } else if (fileUrl) {
      Key = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
    } else {
      return; // No file URL to delete
    }

    await s3client.send(
      new DeleteObjectCommand({
        Bucket: process.env.SPACES_BUCKET,
        Key,
      })
    );

    console.log(`Successfully deleted file: ${Key}`);
  } catch (error) {
    console.error("S3 deletion error:", error);
    throw error;
  }
};

export const getFileUrl = (filename) => {
  if (!filename) return null;
  // Absolute URL (external video URL) — pass through as-is
  if (/^https?:\/\//i.test(filename)) return filename;
  // Check if we have a CDN URL configured, otherwise use the direct bucket URL
  if (process.env.SPACES_CDN_URL) {
    return `${process.env.SPACES_CDN_URL}/${filename}`;
  }
  return `https://${process.env.SPACES_BUCKET}.${process.env.SPACES_REGION}.digitaloceanspaces.com/${filename}`;
};
