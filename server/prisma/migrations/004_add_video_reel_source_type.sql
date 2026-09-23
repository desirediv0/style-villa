-- Video reels can be uploaded files or external direct video URLs (.mp4/.webm/.mov)
ALTER TABLE "VideoReel" ADD COLUMN IF NOT EXISTS "sourceType" TEXT NOT NULL DEFAULT 'upload';
