-- Optional per-product size of the main image on the product page, entered in pixels by the admin
-- and stored as "<width>:<height>" (e.g. "800:1000"). NULL means the storefront default (3:4).
-- The full image is always shown, never cropped.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageAspectRatio" TEXT;
