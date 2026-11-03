-- Repair the order of existing variant images.
--
-- Uploading a variant's images in parallel could leave several images with the same "order"
-- and sometimes more than one image marked primary, so the storefront showed them in an
-- unpredictable order. This renumbers every variant's images 0..n-1 and keeps exactly one
-- primary at position 0:
--   * if some images are marked primary, the one with the lowest position (then the oldest)
--     stays primary and moves to position 0; the other images keep their existing order;
--   * if none is marked primary, the image at the lowest position becomes primary.
--
-- It cannot know which angle you meant to be the front view for products that were already
-- uploaded wrongly. After running it, open those products in the admin and click the star
-- ("Primary") on the correct image. Safe to run more than once.

WITH chosen AS (
  SELECT DISTINCT ON ("variantId") id AS primary_id, "variantId"
  FROM "ProductVariantImage"
  WHERE "isPrimary"
  ORDER BY "variantId", "order" ASC, "createdAt" ASC, id ASC
),
ranked AS (
  SELECT
    i.id,
    ROW_NUMBER() OVER (
      PARTITION BY i."variantId"
      ORDER BY (i.id = c.primary_id) DESC NULLS LAST, i."order" ASC, i."createdAt" ASC, i.id ASC
    ) - 1 AS new_order
  FROM "ProductVariantImage" i
  LEFT JOIN chosen c ON c."variantId" = i."variantId"
)
UPDATE "ProductVariantImage" AS img
SET "order" = ranked.new_order,
    "isPrimary" = (ranked.new_order = 0)
FROM ranked
WHERE img.id = ranked.id
  AND (img."order" <> ranked.new_order OR img."isPrimary" <> (ranked.new_order = 0));
