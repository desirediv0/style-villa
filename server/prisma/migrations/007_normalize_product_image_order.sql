-- Repair the order of existing images of products WITHOUT variants (images stored on the
-- product itself).
--
-- Adding photos through the admin edit form used to give the new photos the same positions as
-- the existing ones and to create a second primary image, and the "add image" endpoint handed
-- out position 0 again and again. This renumbers every product's images 0..n-1 and keeps
-- exactly one primary at position 0:
--   * if some images are marked primary, the one with the lowest position (then the oldest)
--     stays primary and moves to position 0; the other images keep their existing order;
--   * if none is marked primary, the image at the lowest position becomes primary.
--
-- It cannot know which photo you meant to be the main one for products that were already
-- uploaded wrongly. After running it, open those products in the admin and click the star
-- ("Primary") on the correct image. Safe to run more than once.

WITH chosen AS (
  SELECT DISTINCT ON ("productId") id AS primary_id, "productId"
  FROM "ProductImage"
  WHERE "isPrimary"
  ORDER BY "productId", "order" ASC, "createdAt" ASC, id ASC
),
ranked AS (
  SELECT
    i.id,
    ROW_NUMBER() OVER (
      PARTITION BY i."productId"
      ORDER BY (i.id = c.primary_id) DESC NULLS LAST, i."order" ASC, i."createdAt" ASC, i.id ASC
    ) - 1 AS new_order
  FROM "ProductImage" i
  LEFT JOIN chosen c ON c."productId" = i."productId"
)
UPDATE "ProductImage" AS img
SET "order" = ranked.new_order,
    "isPrimary" = (ranked.new_order = 0)
FROM ranked
WHERE img.id = ranked.id
  AND (img."order" <> ranked.new_order OR img."isPrimary" <> (ranked.new_order = 0));
