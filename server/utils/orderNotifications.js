/**
 * Order e-mails: confirmation to the customer + alert to the store, and status updates
 * (shipped / delivered / cancelled / refunded) to the customer.
 *
 * E-mail must never break an order, so every send is wrapped: a failure is logged and swallowed.
 * Callers do not need to await these; they are safe to fire and forget.
 */
import { prisma } from "../config/db.js";
import sendEmail from "./sendEmail.js";
import { getStoreConfig } from "./storeConfig.js";
import {
  getOrderConfirmationTemplate,
  getOrderStatusTemplate,
  getAdminNewOrderTemplate,
} from "../email/temp/EmailTemplate.js";

const orderInclude = {
  user: true,
  shippingAddress: true,
  razorpayPayment: true,
  items: {
    include: {
      product: true,
      variant: {
        include: { attributes: { include: { attributeValue: { include: { attribute: true } } } } },
      },
    },
  },
};

const money = (v) => parseFloat(v || 0).toFixed(2);

const variantLabel = (variant) =>
  (variant?.attributes || [])
    .map((a) => `${a.attributeValue.attribute.name}: ${a.attributeValue.value}`)
    .join(", ");

const paymentLabel = (order) => {
  if (order.paymentMethod === "CASH") return "Cash on Delivery";
  const method = order.razorpayPayment?.paymentMethod;
  return method ? `Online (${method})` : "Online";
};

// Several addresses can be listed, comma separated, in ADMIN_NOTIFY_EMAIL. Defaults to the store e-mail.
const adminRecipients = () =>
  String(process.env.ADMIN_NOTIFY_EMAIL || getStoreConfig().storeEmail || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

async function safeSend(to, subject, html) {
  try {
    await sendEmail({ email: to, subject, html });
    return true;
  } catch (error) {
    console.error(`E-mail "${subject}" to ${to} failed:`, error?.message || error);
    return false;
  }
}

const trackingUrlFor = (awbCode) => (awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null);

/** Confirmation to the customer and a "new order" alert to the store. */
export async function notifyNewOrder(orderId) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
    if (!order) return;

    const items = order.items.map((item) => ({
      name: item.product.name,
      variant: variantLabel(item.variant) + (item.flashSaleName ? ` ⚡ ${item.flashSaleName}` : ""),
      quantity: item.quantity,
      price: money(item.price),
      originalPrice: item.originalPrice ? money(item.originalPrice) : null,
    }));
    const totals = {
      subtotal: money(order.subTotal),
      shipping: money(order.shippingCost),
      tax: money(order.tax),
      discount: money(order.discount),
      codCharge: money(order.codCharge),
      couponCode: order.couponCode || "",
      total: money(order.total),
    };
    const address = order.shippingAddress || {};

    if (order.user?.email) {
      await safeSend(
        order.user.email,
        `Order Confirmation - #${order.orderNumber}`,
        getOrderConfirmationTemplate({
          userName: order.user.name || "Valued Customer",
          orderNumber: order.orderNumber,
          orderDate: order.createdAt,
          paymentMethod: paymentLabel(order),
          items,
          ...totals,
          shippingAddress: address,
        })
      );
    }

    const isCod = order.paymentMethod === "CASH";
    const alertHtml = getAdminNewOrderTemplate({
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customerName: order.user?.name,
      customerEmail: order.user?.email,
      customerPhone: address.phone || order.user?.phone,
      paymentMethod: paymentLabel(order),
      items,
      ...totals,
      shippingAddress: address,
    });
    for (const to of adminRecipients()) {
      await safeSend(to, `New Order #${order.orderNumber} - ₹${totals.total} (${isCod ? "COD" : "Paid online"})`, alertHtml);
    }
  } catch (error) {
    console.error("notifyNewOrder failed:", error?.message || error);
  }
}

const STATUS_SUBJECT = {
  SHIPPED: (n) => `Your order #${n} has been shipped`,
  DELIVERED: (n) => `Your order #${n} has been delivered`,
  CANCELLED: (n) => `Your order #${n} has been cancelled`,
  REFUNDED: (n) => `Refund processed for order #${n}`,
};

/** Status update to the customer. Only the statuses customers care about send anything. */
export async function notifyOrderStatus(orderId, status, extra = {}) {
  try {
    const key = String(status || "").toUpperCase();
    if (!STATUS_SUBJECT[key]) return;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, razorpayPayment: true, tracking: true },
    });
    if (!order?.user?.email) return;

    const awbCode = order.awbCode || order.tracking?.trackingNumber || null;
    await safeSend(
      order.user.email,
      STATUS_SUBJECT[key](order.orderNumber),
      getOrderStatusTemplate({
        userName: order.user.name,
        orderNumber: order.orderNumber,
        status: key,
        awbCode,
        courierName: order.courierName || order.tracking?.carrier || null,
        trackingUrl: trackingUrlFor(order.awbCode),
        total: order.total,
        refundAmount: extra.refundAmount,
        reason: extra.reason || order.cancelReason,
        isPrepaid: !!order.razorpayPayment,
      })
    );
  } catch (error) {
    console.error("notifyOrderStatus failed:", error?.message || error);
  }
}

/** Tell the store something needs a human (for example an automatic refund that Razorpay rejected). */
export async function notifyAdminAttention(subject, lines = []) {
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">
    <h2 style="color:#b91c1c;margin:0 0 12px">Action needed</h2>
    ${lines.map((l) => `<p style="margin:0 0 8px">${String(l).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`).join("")}
  </div>`;
  for (const to of adminRecipients()) await safeSend(to, subject, html);
}
