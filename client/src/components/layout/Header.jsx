"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi, cn, sortCategories } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import {
  IconSearch,
  IconUser,
  IconShoppingBag,
  IconHeart,
  IconMenu2,
  IconX,
  IconPackage,
  IconLogout,
  IconMapPin,
  IconPhone,
  IconBrandInstagram,
  IconArrowUpRight,
} from "@tabler/icons-react";

const CONTACT = {
  email: "stylevilla.ktl@gmail.com",
  phone: "+91 99911 11861",
  whatsapp: "919991111861",
};

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/products", label: "SHOP" },
  { href: "/categories", label: "COLLECTIONS" },
  { href: "/about", label: "ABOUT US" },
  { href: "/contact", label: "CONTACT" },
];

const ANNOUNCEMENTS = [
  "Free Shipping Above 499/-",
  "राधे-राधे",
  "New arrivals every week",
  "Premium bags, clothing, footwear & accessories",
];

function AvatarCircle({ name, size = "sm" }) {
  const dim = size === "lg" ? "w-11 h-11 text-base" : "w-8 h-8 text-sm";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center text-ivory font-display flex-shrink-0 border border-gold/50 bg-noir`}
    >
      {name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [isSearchOpen]);

  useEffect(() => {
    fetchApi("/public/categories")
      .then((res) => setCategories(sortCategories(res.data?.categories || [])))
      .catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const cartCount = getCartItemCount();
  const isHomePage = pathname === "/";
  /* Light theme: the header is always solid ivory with dark type.
     (Set this back to `isHomePage && !isScrolled` to restore the
     transparent white-on-dark overlay used by the dark heroes.) */
  const overHero = false;

  const iconBtn = cn(
    "p-2 transition-colors duration-300 relative",
    overHero ? "text-ivory hover:text-gold-light" : "text-noir hover:text-plum"
  );

  return (
    <>
      <header
        ref={navbarRef}
        className={cn(
          "sticky top-0 left-0 right-0 z-50 w-full bg-ivory-warm/95 backdrop-blur-xl transition-shadow duration-500",
          isScrolled
            ? "shadow-[0_1px_0_0_rgba(13,11,12,0.06),0_18px_40px_-30px_rgba(13,11,12,0.25)]"
            : "shadow-[0_1px_0_0_rgba(13,11,12,0.06)]"
        )}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0D0B0C",
              color: "#F7F4EE",
              border: "1px solid rgba(192,160,98,0.4)",
              borderRadius: "0",
              fontSize: "13px",
              letterSpacing: "0.02em",
            },
          }}
        />

        {/* Announcement ribbon */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-700",
            isHomePage && isScrolled ? "h-0 opacity-0" : "h-auto opacity-100"
          )}
        >
          <div className="bg-gradient-to-r from-plum via-plum-deep to-azure text-white">
            <div className="py-2 px-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="hidden md:flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/stylevillaofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <IconBrandInstagram className="h-4 w-4" stroke={1.5} />
                  </a>
                  <a
                    href="https://www.facebook.com/stylevillafamily"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>

                <div className="flex-1 mx-2 md:mx-4 overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap text-[10px] tracking-[0.3em] uppercase font-medium text-white/90">
                    {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((txt, i) => (
                      <span key={i} className="mx-4">
                        {txt}
                        <span className="ml-8 text-white/70">✦</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-5 text-[9px] tracking-[0.3em] uppercase font-medium">
                  <Link href="/track-order" className="text-white/70 hover:text-white transition-colors">
                    Track Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main header row */}
        <div className="transition-all duration-700">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-16 md:h-[72px] gap-4">
              {/* Mobile: Search icon left */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn("md:hidden", iconBtn)}
                aria-label="Search"
              >
                <IconSearch className="h-5 w-5" stroke={1.5} />
              </button>

              {/* Desktop: Logo left */}
              <div className="hidden md:flex items-center">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="Style Villa"
                    width={100}
                    height={100}
                    className={cn(
                      "h-11 w-auto object-contain transition-all duration-700",
                      overHero ? "brightness-0 invert" : ""
                    )}
                  />
                </Link>
              </div>

              {/* Mobile: Logo center */}
              <div className="md:hidden flex-1 flex justify-center">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/logo.png"
                    alt="Style Villa"
                    width={80}
                    height={80}
                    className={cn(
                      "h-9 w-auto object-contain transition-all duration-700",
                      overHero ? "brightness-0 invert" : ""
                    )}
                  />
                </Link>
              </div>

              {/* Desktop: Search bar center */}
              <div className="hidden md:flex flex-1 max-w-md mx-6">
                <form onSubmit={handleSearch} className="w-full relative group">
                  <input
                    type="text"
                    placeholder="Search the collection…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full h-10 pl-5 pr-11 text-[13px] tracking-wide transition-all duration-500 border-b bg-transparent",
                      overHero
                        ? "border-white/30 text-ivory placeholder:text-white/50 focus:outline-none focus:border-gold-light"
                        : "border-noir/15 text-noir placeholder:text-stone focus:outline-none focus:border-gold-dark"
                    )}
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className={cn(
                      "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center transition-all duration-300",
                      overHero ? "text-white/70 hover:text-gold-light" : "text-stone hover:text-gold-dark"
                    )}
                  >
                    <IconSearch className="h-4 w-4" stroke={1.5} />
                  </button>
                </form>
              </div>

              {/* Right: Icons */}
              <div className="flex items-center gap-0.5 sm:gap-2">
                {/* Desktop: User icon */}
                <div className="hidden sm:block">
                  <ClientOnly>
                    {isAuthenticated ? (
                      <Link href="/account" className={iconBtn} aria-label="Account">
                        <AvatarCircle name={user?.name} size="sm" />
                      </Link>
                    ) : (
                      <Link href="/auth" className={iconBtn} aria-label="Login">
                        <IconUser className="h-5 w-5" stroke={1.5} />
                      </Link>
                    )}
                  </ClientOnly>
                </div>

                {/* Wishlist */}
                <Link href="/wishlist" className={iconBtn} aria-label="Wishlist">
                  <IconHeart className="h-5 w-5" stroke={1.5} />
                </Link>

                {/* Cart */}
                <ClientOnly>
                  <Link href="/cart" className={iconBtn} aria-label="Cart">
                    <IconShoppingBag className="h-5 w-5" stroke={1.5} />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center bg-azure">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </ClientOnly>

                {/* Mobile: Menu */}
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className={cn("md:hidden", iconBtn)}
                  aria-label="Menu"
                >
                  <IconMenu2 className="h-5 w-5" stroke={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Navigation menu below header */}
        <div
          className={cn(
            "hidden md:block transition-all duration-700 border-b",
            overHero ? "border-white/10" : "border-noir/5"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <nav className="flex items-center justify-center gap-10 h-11">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative py-2 text-[10.5px] tracking-[0.28em] font-medium transition-colors duration-300 group",
                      overHero
                        ? active
                          ? "text-gold-light"
                          : "text-ivory/85 hover:text-ivory"
                        : active
                          ? "text-plum"
                          : "text-noir/70 hover:text-noir"
                    )}
                  >
                    {label}
                    <span
                      className={cn(
                        "absolute left-0 -bottom-[1px] h-px w-full origin-left transition-transform duration-500",
                        overHero ? "bg-gradient-to-r from-gold-light to-azure-light" : "bg-gradient-to-r from-plum to-azure",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      )}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <SearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        searchInputRef={searchInputRef}
        categories={categories}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        categories={categories}
        cartCount={cartCount}
        handleLogout={handleLogout}
        pathname={pathname}
      />
    </>
  );
}

function SearchDialog({ open, onOpenChange, searchQuery, setSearchQuery, handleSearch, searchInputRef, categories }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-ivory-warm p-0 overflow-hidden border border-line rounded-none shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-2">
          <DialogTitle className="text-center">
            <span className="luxe-eyebrow block mb-2">Style Villa</span>
            <span className="font-display text-2xl font-medium text-noir">Search the Maison</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-8">
          <form onSubmit={handleSearch} className="relative mt-4">
            <IconSearch className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gold-dark" stroke={1.5} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Bags, dresses, accessories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-8 pr-24 text-sm bg-transparent border-b border-noir/20 focus:outline-none focus:border-gold-dark transition-all duration-300 placeholder:text-stone"
              autoComplete="off"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 text-stone hover:text-noir"
                  aria-label="Clear"
                >
                  <IconX className="h-4 w-4" stroke={1.5} />
                </button>
              )}
              <button
                type="submit"
                className="h-9 px-5 bg-noir text-ivory text-[10px] uppercase tracking-[0.25em] font-semibold transition-all duration-300 hover:bg-gold hover:text-white"
              >
                Search
              </button>
            </div>
          </form>

          {categories.length > 0 && (
            <div className="mt-8">
              <p className="text-[9px] uppercase tracking-[0.35em] mb-4 text-stone font-medium">
                Browse Collections
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="px-4 py-2 text-[11px] tracking-[0.12em] uppercase border border-line transition-all duration-300 text-noir/70 hover:border-gold hover:bg-noir hover:text-gold-light"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileMenu({ isOpen, onClose, user, isAuthenticated, categories, cartCount, handleLogout, pathname }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <motion.div
            className="absolute inset-0 bg-noir/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[88%] max-w-[360px] bg-ivory-warm text-noir shadow-2xl flex flex-col luxe-aurora-light"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-line flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Style Villa"
                width={100}
                height={40}
                className="h-9 w-auto object-contain"
              />
              <button onClick={onClose} className="p-2 text-stone hover:text-plum transition-colors" aria-label="Close menu">
                <IconX className="h-5 w-5" stroke={1.5} />
              </button>
            </div>

            {/* User section */}
            <ClientOnly>
              <div className="relative z-10 px-6 py-5 border-b border-line flex-shrink-0">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <AvatarCircle name={user?.name} size="lg" />
                    <div className="min-w-0">
                      <p className="font-display text-base text-noir truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-stone truncate">{user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link href="/auth" className="flex-1" onClick={onClose}>
                      <button className="w-full h-11 text-[10px] uppercase tracking-[0.25em] font-semibold text-white bg-gold hover:bg-gold-dark transition-colors">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/auth?tab=register" className="flex-1" onClick={onClose}>
                      <button className="w-full h-11 text-[10px] uppercase tracking-[0.25em] font-semibold text-noir border border-line hover:border-plum hover:text-plum transition-colors">
                        Register
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </ClientOnly>

            {/* Navigation */}
            <div className="relative z-10 flex-1 overflow-y-auto py-4" data-lenis-prevent>
              <div className="px-6">
                {NAV_LINKS.map(({ href, label }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "flex items-baseline gap-3 py-3 group",
                        pathname === href ? "text-plum" : "text-noir"
                      )}
                    >
                      <span className="text-[9px] tracking-[0.2em] text-stone font-medium">
                        0{i + 1}
                      </span>
                      <span className="font-display text-2xl tracking-wide group-hover:text-plum transition-colors">
                        {label.charAt(0) + label.slice(1).toLowerCase()}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="mt-6 pt-6 border-t border-line px-6">
                  <p className="pb-3 text-[9px] uppercase tracking-[0.35em] text-plum font-medium">
                    Collections
                  </p>
                  {categories.slice(0, 8).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between py-2.5 text-sm text-stone-dark hover:text-plum transition-colors group"
                    >
                      <span className="tracking-wide">{cat.name}</span>
                      <IconArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" stroke={1.5} />
                    </Link>
                  ))}
                </div>
              )}

              {/* Account links */}
              <ClientOnly>
                {isAuthenticated && (
                  <div className="mt-4 pt-4 border-t border-line px-6">
                    <p className="pb-3 text-[9px] uppercase tracking-[0.35em] text-plum font-medium">
                      Account
                    </p>
                    {[
                      { href: "/account", icon: IconUser, label: "Profile" },
                      { href: "/account/orders", icon: IconPackage, label: "My Orders" },
                      { href: "/account/addresses", icon: IconMapPin, label: "Addresses" },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={onClose}
                        className="flex items-center gap-3 py-2.5 text-sm text-stone-dark hover:text-plum transition-colors"
                      >
                        <Icon className="h-4 w-4 text-stone" stroke={1.5} />
                        {label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleLogout();
                        onClose();
                      }}
                      className="flex items-center gap-3 w-full py-2.5 text-sm text-brand-error hover:text-red-700 transition-colors"
                    >
                      <IconLogout className="h-4 w-4" stroke={1.5} />
                      Sign Out
                    </button>
                  </div>
                )}
              </ClientOnly>

              {/* Help links */}
              <div className="mt-4 pt-4 border-t border-line px-6">
                <p className="pb-3 text-[9px] uppercase tracking-[0.35em] text-plum font-medium">
                  Help
                </p>
                {[
                  { href: "/about", label: "About Us" },
                  { href: "/contact", label: "Contact" },
                  { href: "/shipping-policy", label: "Shipping Policy" },
                  { href: "/faqs", label: "FAQs" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="block py-2.5 text-sm text-stone-dark hover:text-plum transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Contact */}
              <div className="mx-6 mt-6 mb-8 p-4 border border-line">
                <p className="text-[9px] uppercase tracking-[0.35em] text-stone mb-2 font-medium">Concierge</p>
<a
  href={`https://wa.me/${CONTACT.whatsapp}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2.5 text-sm text-stone-dark hover:text-plum transition-colors"
  aria-label="WhatsApp"
>
  <IconPhone className="h-4 w-4 text-gold/70" stroke={1.5} />
  {CONTACT.phone}
</a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Navbar;
