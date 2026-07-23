/**
 * Store Configuration Utility
 * Centralized configuration for store name, email, and other store-specific settings
 * All values can be overridden via environment variables
 */

export const getStoreConfig = () => {
  return {
    // Store Information
    storeName: process.env.STORE_NAME || "Style Villa",
    storeEmail: process.env.STORE_EMAIL || "stylevilla.ktl@gmail.com",
    storePhone: process.env.STORE_PHONE || "+91 99911 11861",
    storeAddress: process.env.STORE_ADDRESS || "India",

    // Store Description/Tagline
    storeTagline: process.env.STORE_TAGLINE || "Premium Fashion & Lifestyle",
    storeDescription:
      process.env.STORE_DESCRIPTION ||
      "Discover Style Villa — your destination for premium imported fashion, clothing, handbags, footwear and accessories. Luxury styles for Women, Men & Youth.",

    // Email Configuration
    fromName: process.env.FROM_NAME || process.env.STORE_NAME || "Style Villa",
    fromEmail:
      process.env.FROM_EMAIL ||
      process.env.STORE_EMAIL ||
      process.env.SMTP_USER ||
      "stylevilla.ktl@gmail.com",

    // Website Information
    websiteUrl: process.env.WEBSITE_URL || "https://stylevillaofficial.com",
    supportEmail:
      process.env.SUPPORT_EMAIL ||
      process.env.STORE_EMAIL ||
      "stylevilla.ktl@gmail.com",

    // Social Media (optional)
    socialFacebook: process.env.SOCIAL_FACEBOOK || "",
    socialTwitter: process.env.SOCIAL_TWITTER || "",
    socialInstagram: process.env.SOCIAL_INSTAGRAM || "https://www.instagram.com/stylevillaofficial",
    socialYoutube: process.env.SOCIAL_YOUTUBE || "https://www.youtube.com/@stylevillabypoojakhan",
    socialWhatsapp: process.env.SOCIAL_WHATSAPP || "919991111861",
  };
};

/**
 * Get store name
 */
export const getStoreName = () => {
  return getStoreConfig().storeName;
};

/**
 * Get store email
 */
export const getStoreEmail = () => {
  return getStoreConfig().storeEmail;
};

/**
 * Get from name for emails
 */
export const getFromName = () => {
  return getStoreConfig().fromName;
};

/**
 * Get from email for emails
 */
export const getFromEmail = () => {
  return getStoreConfig().fromEmail;
};

/**
 * Get full store information object
 */
export const getFullStoreInfo = () => {
  const config = getStoreConfig();
  return {
    name: config.storeName,
    email: config.storeEmail,
    phone: config.storePhone,
    address: config.storeAddress,
    tagline: config.storeTagline,
    description: config.storeDescription,
    websiteUrl: config.websiteUrl,
    supportEmail: config.supportEmail,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
    social: {
      facebook: config.socialFacebook,
      twitter: config.socialTwitter,
      instagram: config.socialInstagram,
      youtube: config.socialYoutube,
    },
  };
};

export default getStoreConfig;
