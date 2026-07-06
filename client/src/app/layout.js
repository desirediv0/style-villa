import "./globals.css";
import { Navbar } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { FloatingWhatsApp } from "@/components/ui/FloatingWhatsApp";

export const metadata = {
  title: "Style Villa | Premium Fashion & Lifestyle",
  description: "Discover Style Villa — your destination for premium imported fashion, clothing, handbags, footwear and accessories. Luxury styles for Women, Men & Youth.",
  keywords: "Style Villa, premium fashion, luxury clothing, handbags, footwear, accessories, imported fashion, designer wear, women fashion, men fashion",
  authors: [{ name: "Style Villa" }],
  openGraph: {
    title: "Style Villa | Premium Fashion & Lifestyle",
    description: "Premium imported fashion, clothing, handbags, footwear and accessories.",
    type: "website",
    locale: "en_IN",
    siteName: "Style Villa",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
            <FloatingWhatsApp />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
