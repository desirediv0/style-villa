-- Optional per-product social/reel link (Instagram / Facebook / YouTube) shown on the product page.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "socialVideoUrl" TEXT;
