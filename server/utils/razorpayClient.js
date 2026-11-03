/**
 * Razorpay access for the store. The keys live (encrypted) in the database, not in the environment, so
 * everything that talks to Razorpay (checkout, payment verification, refunds) must get its client from here.
 */
import Razorpay from "razorpay";
import { prisma } from "../config/db.js";
import { ApiError } from "./ApiError.js";
import { decrypt } from "./encryption.js";

export async function getPaymentGatewayConfig(userId = null, gateway = "RAZORPAY") {
  let paymentSettings;

  if (userId) {
    paymentSettings = await prisma.paymentGatewaySetting.findUnique({
      where: { userId_gateway: { userId, gateway: gateway.toUpperCase() } },
    });
  }

  if (!paymentSettings) {
    paymentSettings = await prisma.paymentGatewaySetting.findFirst({
      where: { gateway: gateway.toUpperCase(), isActive: true },
    });
  }

  if (!paymentSettings || !paymentSettings.isActive) {
    throw new ApiError(
      400,
      `Payment gateway ${gateway} is not configured or not active. Please configure payment gateway keys in admin settings.`
    );
  }

  if (gateway.toUpperCase() === "RAZORPAY") {
    if (!paymentSettings.razorpayKeyId || !paymentSettings.razorpayKeySecret) {
      throw new ApiError(400, "Razorpay keys are not configured. Please configure Razorpay Key ID and Key Secret in Payment Gateway Settings.");
    }

    let decryptedSecret;
    try {
      decryptedSecret = decrypt(paymentSettings.razorpayKeySecret);
      if (!decryptedSecret || decryptedSecret.trim() === "") {
        throw new Error("Decrypted secret is empty");
      }
    } catch (decryptError) {
      console.error("Error decrypting Razorpay key secret:", decryptError);
      throw new ApiError(400, "Failed to decrypt Razorpay key secret. Please reconfigure your Razorpay keys.");
    }

    let razorpayInstance;
    try {
      razorpayInstance = new Razorpay({
        key_id: paymentSettings.razorpayKeyId,
        key_secret: decryptedSecret,
      });
    } catch (razorpayError) {
      console.error("Error initializing Razorpay:", razorpayError);
      throw new ApiError(400, `Failed to initialize Razorpay: ${razorpayError.message || "Invalid keys"}`);
    }

    return {
      razorpayInstance,
      paymentSettings: {
        gateway: paymentSettings.gateway,
        mode: paymentSettings.mode,
        userId: paymentSettings.userId,
        razorpayKeyId: paymentSettings.razorpayKeyId,
        razorpayKeySecret: decryptedSecret,
      },
    };
  }

  // For PhonePe, return settings without Razorpay instance
  return {
    razorpayInstance: null,
    paymentSettings: {
      gateway: paymentSettings.gateway,
      mode: paymentSettings.mode,
      userId: paymentSettings.userId,
      phonepeMerchantId: paymentSettings.phonepeMerchantId,
      phonepeSaltKey: paymentSettings.phonepeSaltKey ? decrypt(paymentSettings.phonepeSaltKey) : null,
      phonepeSaltIndex: paymentSettings.phonepeSaltIndex,
    },
  };
}

/** Rupees (number or Decimal string) to the whole paise Razorpay expects. */
export const toPaise = (rupees) => Math.round((parseFloat(rupees) + Number.EPSILON) * 100);

/**
 * Refund a captured payment through Razorpay, using the store's real (database) keys.
 * Throws if Razorpay refuses, so callers can decide what to tell the user instead of silently carrying on.
 */
export async function refundRazorpayPayment({ razorpayPaymentId, amount, reason, paymentOwnerId = null }) {
  const { razorpayInstance } = await getPaymentGatewayConfig(paymentOwnerId, "RAZORPAY");
  return razorpayInstance.payments.refund(razorpayPaymentId, {
    amount: toPaise(amount),
    notes: { reason: reason || "Refund" },
  });
}

/** Razorpay error objects carry the useful text in error.error.description. */
export const razorpayErrorMessage = (err) =>
  err?.error?.description || err?.message || "Razorpay error";
