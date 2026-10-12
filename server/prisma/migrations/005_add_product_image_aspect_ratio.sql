-- Optional per-product shape (width:height) for the main image box on the product page.
-- NULL means the storefront default (3:4). The full image is always shown, never cropped.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "imageAspectRatio" TEXT;
