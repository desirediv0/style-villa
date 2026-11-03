/**
 * Single source of truth for what an order costs.
 *
 * The cart page, the Razorpay order, the payment verification and the Cash-on-Delivery order all
 * used to work this out separately (and slightly differently: for example the online order left the
 * flash-sale discount out of its subtotal). Everything now goes through the functions below, so the
 * amount the customer sees is the amount that is charged and the amount that is saved on the order.
 *
 * `db` is either `prisma` or a transaction client.
 */
import { ApiError } from "./ApiError.js";

export const toNumber = (v) => parseFloat(v ?? 0) || 0;
export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/**
 * Unit price of a variant for a given quantity:
 * pricing slab (variant slabs and product slabs, lowest minimum quantity first), otherwise the sale
 * or list price; then an active flash sale takes its percentage off that price.
 */
export async function getEffectivePrice(db, variant, quantity, now = new Date()) {
  const [variantSlabs, productSlabs] = await Promise.all([
    db.pricingSlab.findMany({ where: { variantId: variant.id }, orderBy: { minQty: "asc" } }),
    db.pricingSlab.findMany({
      where: { productId: variant.productId, variantId: null },
      orderBy: { minQty: "asc" },
    }),
  ]);
  const allSlabs = [...variantSlabs, ...productSlabs].sort((a, b) => a.minQty - b.minQty);

  let price = parseFloat(variant.salePrice || variant.price);
  let priceSource = "DEFAULT";
  let appliedSlab = null;

  for (const slab of allSlabs) {
    if (quantity >= slab.minQty && (slab.maxQty === null || quantity <= slab.maxQty)) {
      price = parseFloat(slab.price);
      priceSource = slab.variantId ? "VARIANT_SLAB" : "PRODUCT_SLAB";
      appliedSlab = { id: slab.id, minQty: slab.minQty, maxQty: slab.maxQty, price: parseFloat(slab.price) };
      break;
    }
  }

  const flashSaleProduct = await db.flashSaleProduct.findFirst({
    where: {
      productId: variant.productId,
      flashSale: { isActive: true, startTime: { lte: now }, endTime: { gte: now } },
    },
    include: {
      flashSale: { select: { id: true, name: true, discountPercentage: true, endTime: true } },
    },
  });

  const priceBeforeFlashSale = price;
  let flashSale = null;
  if (flashSaleProduct) {
    const off = (price * flashSaleProduct.flashSale.discountPercentage) / 100;
    price = Math.round((price - off) * 100) / 100;
    priceSource = "FLASH_SALE";
    flashSale = {
      flashSaleId: flashSaleProduct.flashSale.id,
      name: flashSaleProduct.flashSale.name,
      discountPercentage: flashSaleProduct.flashSale.discountPercentage,
      endTime: flashSaleProduct.flashSale.endTime,
      originalPrice: priceBeforeFlashSale,
    };
  }

  return { price, priceBeforeFlashSale, priceSource, appliedSlab, allSlabs, flashSale };
}

/** Shipping from the store's Shiprocket settings: a flat charge, free above the threshold. */
export function calcShipping(settings, subTotal) {
  if (!settings) return { shippingCost: 0, freeShippingThreshold: 0 };
  const charge = toNumber(settings.shippingCharge);
  // The threshold only matters when there is a charge to waive
  const freeShippingThreshold = charge > 0 ? toNumber(settings.freeShippingThreshold) : 0;
  let shippingCost = 0;
  if (charge > 0) {
    shippingCost = freeShippingThreshold > 0 && subTotal >= freeShippingThreshold ? 0 : charge;
  }
  return { shippingCost, freeShippingThreshold };
}

export const COUPON_INCLUDE = { categories: true, products: true, brands: true };

/**
 * Discount a coupon gives on a list of cart lines.
 * `items`: [{ productId, brandId, categoryIds, price, quantity }] where price is the effective unit price.
 * Rules (unchanged from the coupon preview): optional product/category/brand targeting, minimum order on the
 * applicable amount, usage limit, percentage capped at 90%, and never more than 90% of the applicable amount.
 */
export function calcCouponDiscount(coupon, items, { ignoreTargets = false } = {}) {
  const subtotal = items.reduce((s, i) => s + toNumber(i.price) * (i.quantity || 1), 0);
  let applicableSubtotal = subtotal;
  let matchedItems = 0;

  const hasTargets =
    !ignoreTargets &&
    ((coupon.categories && coupon.categories.length) ||
      (coupon.products && coupon.products.length) ||
      (coupon.brands && coupon.brands.length));

  if (hasTargets) {
    const categorySet = new Set((coupon.categories || []).map((c) => c.categoryId));
    const productSet = new Set((coupon.products || []).map((p) => p.productId));
    const brandSet = new Set((coupon.brands || []).map((b) => b.brandId));

    let matchedSubtotal = 0;
    for (const item of items) {
      const price = toNumber(item.price) * (item.quantity || 1);
      const productMatch = productSet.has(item.productId);
      const brandMatch = item.brandId && brandSet.has(item.brandId);
      const categoryMatch = (item.categoryIds || []).some((c) => categorySet.has(c));
      if (productMatch || brandMatch || categoryMatch) {
        matchedItems++;
        matchedSubtotal += price;
      }
    }
    applicableSubtotal = matchedSubtotal;
    if (matchedItems === 0) {
      throw new ApiError(400, "This coupon does not apply to the products in your cart");
    }
  }

  if (coupon.minOrderAmount && applicableSubtotal < toNumber(coupon.minOrderAmount)) {
    throw new ApiError(400, `Minimum order amount of ₹${coupon.minOrderAmount} required`);
  }
  if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
    throw new ApiError(400, "Coupon usage limit exceeded");
  }

  let discount;
  if (coupon.discountType === "PERCENTAGE") {
    discount = (applicableSubtotal * Math.min(toNumber(coupon.discountValue), 90)) / 100;
  } else {
    discount = toNumber(coupon.discountValue);
  }
  discount = Math.min(discount, applicableSubtotal * 0.9);

  return { discount: round2(discount), applicableSubtotal: round2(applicableSubtotal), matchedItems };
}

/** The coupon the customer is using, or an error if it is not valid any more. Only active coupons count. */
export async function loadCoupon(db, { couponId, couponCode }) {
  if (!couponId && !couponCode) return null;
  const coupon = await db.coupon.findFirst({
    where: { isActive: true, ...(couponId ? { id: couponId } : {}), ...(couponCode ? { code: couponCode } : {}) },
    include: COUPON_INCLUDE,
  });
  if (!coupon) throw new ApiError(400, "This coupon is not valid any more. Please remove it and try again.");
  return coupon;
}

/**
 * Everything the checkout needs, worked out on the server from the customer's saved cart:
 * priced lines (slab + flash sale), subtotal, shipping, coupon discount, COD charge and the final total.
 * Throws a 400 ApiError for an empty cart, unavailable or out-of-stock items, or an invalid coupon.
 * The coupon discount is always computed here; any discount figure sent by the browser is ignored.
 */
export async function buildCheckoutSummary(db, userId, { couponId, couponCode, paymentMethod = "ONLINE", now = new Date() } = {}) {
  const cartItems = await db.cartItem.findMany({
    where: { userId },
    include: {
      productVariant: { include: { product: { include: { categories: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!cartItems.length) throw new ApiError(400, "No items in cart");

  const items = [];
  let subTotal = 0;
  for (const cartItem of cartItems) {
    const variant = cartItem.productVariant;
    const product = variant.product;

    if (!variant.isActive || !product.isActive) {
      throw new ApiError(400, `${product.name} is no longer available`);
    }
    if (variant.quantity < cartItem.quantity) {
      throw new ApiError(400, `Not enough stock for ${product.name}`);
    }

    const p = await getEffectivePrice(db, variant, cartItem.quantity, now);
    const lineTotal = round2(p.price * cartItem.quantity);
    subTotal += lineTotal;

    items.push({
      cartItemId: cartItem.id,
      variantId: variant.id,
      productId: product.id,
      brandId: product.brandId || null,
      categoryIds: (product.categories || []).map((c) => c.categoryId),
      name: product.name,
      quantity: cartItem.quantity,
      price: p.price,
      lineTotal,
      flashSale: p.flashSale,
    });
  }
  subTotal = round2(subTotal);

  const shiprocketSettings = await db.shiprocketSettings.findFirst();
  const { shippingCost } = calcShipping(shiprocketSettings, subTotal);

  let coupon = null;
  let discount = 0;
  if (couponId || couponCode) {
    coupon = await loadCoupon(db, { couponId, couponCode });
    discount = calcCouponDiscount(coupon, items).discount;
  }

  let codCharge = 0;
  if (paymentMethod === "CASH") {
    const paymentSettings = await db.paymentSettings.findFirst();
    codCharge = toNumber(paymentSettings?.codCharge);
  }

  const total = round2(subTotal + shippingCost + codCharge - discount);

  return { cartItems, items, subTotal, shippingCost, discount, codCharge, tax: 0, total, coupon };
}
