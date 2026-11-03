/**
 * Partner commission for a delivered order.
 *
 * A partner earns their coupon's commission % on the order's goods value after the coupon discount
 * (subtotal - discount; shipping and the COD charge are not commission-bearing). The rows created here
 * are the single source of truth: every partner screen and the admin payouts read PartnerEarning, so a
 * partner sees the same figure everywhere.
 *
 * Both the admin "mark delivered" action and the Shiprocket delivery webhook call this, and it is safe to
 * call more than once for the same order.
 */
import { toNumber, round2 } from "./pricing.js";

export async function createPartnerEarningsForDeliveredOrder(db, orderId) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || !order.couponId) return [];

  const already = await db.partnerEarning.count({ where: { orderId } });
  if (already > 0) return [];

  const commissionBase = round2(toNumber(order.subTotal) - toNumber(order.discount));
  if (commissionBase <= 0) return [];

  const couponPartners = await db.couponPartner.findMany({
    where: { couponId: order.couponId },
    include: { partner: true },
  });

  const created = [];
  for (const couponPartner of couponPartners) {
    if (!couponPartner.commission || couponPartner.commission <= 0) continue;
    const amount = round2((commissionBase * couponPartner.commission) / 100);
    created.push(
      await db.partnerEarning.create({
        data: {
          partnerId: couponPartner.partnerId,
          orderId,
          couponId: order.couponId,
          amount: amount.toFixed(2),
          percentage: couponPartner.commission,
        },
      })
    );
  }
  return created;
}
