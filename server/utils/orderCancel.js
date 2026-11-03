/**
 * Cancelling an order and refunding its payment, in one place.
 *
 * Used by the customer "cancel order" endpoints and by the admin status change, so that all of them
 * restock the items, cancel the courier shipment and refund online payments the same way.
 */
import { prisma } from "../config/db.js";
import { ApiError } from "./ApiError.js";
import { refundRazorpayPayment, razorpayErrorMessage } from "./razorpayClient.js";
import { cancelShiprocketOrder, getShiprocketSettings } from "./shiprocket.js";
import { notifyOrderStatus, notifyAdminAttention } from "./orderNotifications.js";

const CUSTOMER_CANCELLABLE = ["PENDING", "PROCESSING", "PAID"];

// What Razorpay really captured (kept in the stored payment details, in paise). Falls back to the order total.
const paidAmount = (order) => {
  const paise = Number(order.razorpayPayment?.notes?.amount);
  return Number.isFinite(paise) && paise > 0 ? paise / 100 : parseFloat(order.total);
};

/**
 * Refund the online payment of an order and record it.
 * Does nothing for Cash on Delivery orders or payments that were already refunded.
 * Throws if Razorpay refuses, so the caller can decide what to tell the user.
 * `order` must include `razorpayPayment`.
 */
export async function refundOrderPayment(order, reason) {
  const payment = order.razorpayPayment;
  if (!payment || !payment.razorpayPaymentId) return { refunded: false, why: "no online payment" };
  if (payment.status === "REFUNDED") return { refunded: false, why: "already refunded" };

  const amount = paidAmount(order);
  const refund = await refundRazorpayPayment({
    razorpayPaymentId: payment.razorpayPaymentId,
    amount,
    reason,
    paymentOwnerId: order.paymentOwnerId,
  });

  await prisma.$transaction([
    prisma.razorpayRefund.create({
      data: {
        razorpayPaymentId: payment.razorpayPaymentId,
        amount: amount.toFixed(2),
        razorpayRefundId: refund.id,
        status: "PROCESSED",
        reason,
        notes: refund.notes || {},
      },
    }),
    prisma.razorpayPayment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } }),
  ]);

  return { refunded: true, refund, amount };
}

/** Cancel the courier booking, if there is one. Never throws: the order itself is already cancelled. */
export async function cancelShiprocketShipment(order) {
  if (!order.shiprocketOrderId) return false;
  try {
    const settings = await getShiprocketSettings();
    if (!settings.isEnabled) return false;
    await cancelShiprocketOrder(order.shiprocketOrderId);
    await prisma.order.update({ where: { id: order.id }, data: { shiprocketStatus: "CANCELLED" } });
    return true;
  } catch (error) {
    console.error("Failed to cancel Shiprocket order:", error?.message || error);
    return false;
  }
}

/** Put the items of an order back in stock (inside a transaction). */
export async function restockOrderItems(tx, order, { reason, userId }) {
  for (const item of order.items) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: { quantity: { increment: item.quantity } },
    });
    const after = await tx.productVariant.findUnique({ where: { id: item.variantId }, select: { quantity: true } });
    await tx.inventoryLog.create({
      data: {
        variantId: item.variantId,
        quantityChange: item.quantity,
        reason,
        referenceId: order.id,
        previousQuantity: after.quantity - item.quantity,
        newQuantity: after.quantity,
        createdBy: userId,
      },
    });
  }
}

/**
 * A customer cancels their own order before it ships. The items go back in stock, the courier booking is
 * cancelled, and a paid-online order is refunded to the original payment method straight away.
 */
export async function cancelOrderForCustomer({ orderId, userId, reason }) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true, razorpayPayment: true },
  });
  if (!order) throw new ApiError(404, "Order not found");
  if (!CUSTOMER_CANCELLABLE.includes(order.status)) throw new ApiError(400, "This order cannot be cancelled");

  await prisma.$transaction(async (tx) => {
    // Only one cancellation can win, so a double click cannot restock twice
    const flipped = await tx.order.updateMany({
      where: { id: orderId, status: { in: CUSTOMER_CANCELLABLE } },
      data: { status: "CANCELLED", cancelReason: reason, cancelledAt: new Date(), cancelledBy: userId },
    });
    if (flipped.count === 0) throw new ApiError(400, "This order cannot be cancelled");
    await restockOrderItems(tx, order, { reason: "cancellation", userId });
  });

  await cancelShiprocketShipment(order);

  let refund = null;
  let refundFailed = false;
  if (order.razorpayPayment && order.razorpayPayment.status === "CAPTURED") {
    try {
      const outcome = await refundOrderPayment(order, `Order ${order.orderNumber} cancelled by customer`);
      if (outcome.refunded) refund = { amount: outcome.amount, refundId: outcome.refund.id };
    } catch (error) {
      refundFailed = true;
      const message = razorpayErrorMessage(error);
      console.error(`Refund for cancelled order ${order.orderNumber} failed:`, message);
      await prisma.activityLog
        .create({
          data: {
            entityType: "order",
            entityId: orderId,
            action: "refund_failed",
            description: `Customer cancelled; automatic refund failed: ${message}`,
            performedBy: userId,
            performedByRole: "system",
          },
        })
        .catch(() => {});
      notifyAdminAttention(`ACTION NEEDED: refund failed for cancelled order ${order.orderNumber}`, [
        `The customer cancelled order ${order.orderNumber} but Razorpay refused the automatic refund: ${message}`,
        `Open the order in the admin and mark it as REFUNDED to retry, or refund payment ${order.razorpayPayment.razorpayPaymentId} from the Razorpay dashboard.`,
      ]);
    }
  }

  notifyOrderStatus(orderId, "CANCELLED", { reason });

  const updated = await prisma.order.findUnique({ where: { id: orderId } });
  return { order: updated, refund, refundFailed };
}
