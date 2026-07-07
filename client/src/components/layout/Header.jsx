"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi, cn, sortCategories } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import {
  IconSearch,
  IconUser,
  IconShoppingBag,
  IconHeart,
  IconMenu2,
  IconX,
  IconChevronDown,
  IconChevronRight,
  IconPackage,
  IconLogout,
  IconMapPin,
  IconMail,
  IconPhone,
  IconBrandInstagram,
  IconBrandYoutube,
  IconHome,
  IconGridDots,
  IconMenu,
} from "@tabler/icons-react";

const CONTACT = {
  email: "stylevilla@gmail.com",
  phone: "+91 87964 49692",
  whatsapp: "918796449692",
};

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/products", label: "SHOP" },
  { href: "/categories", label: "COLLECTIONS" },
  { href: "/about", label: "ABOUT US" },
  { href: "/contact", label: "CONTACT" },
];

function AvatarCircle({ name, size = "sm" }) {
  const dim = size === "lg" ? "w-11 h-11 text-base" : "w-8 h-8 text-sm";
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}
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

  return (
    <>
      <header
        ref={navbarRef}
        className={cn(
          "top-0 left-0 right-0 z-50 w-full transition-all duration-500",
          isHomePage
            ? cn("fixed", isScrolled ? "bg-white shadow-lg" : "bg-transparent")
            : "sticky bg-white shadow-sm"
        )}
      >
        <Toaster position="top-center" richColors />

        {/* Announcement marquee bar */}
        <div className={cn(
          "overflow-hidden transition-all duration-500",
          isHomePage && isScrolled ? "h-0 opacity-0" : "h-auto opacity-100"
        )}>
          <div className="text-white" style={{ background: "linear-gradient(90deg, #A458A6, #14A8E6)" }}>
            <div className="py-2 px-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="hidden md:flex items-center gap-4">
                  <a href="https://www.instagram.com/stylevillaofficial" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                    <IconBrandInstagram className="h-4 w-4" stroke={1.5} />
                  </a>
                  <a href="https://www.facebook.com/stylevillafamily" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>

                <div className="flex-1 mx-4 overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap text-[11px] tracking-[0.15em] uppercase font-medium">
                    <span className="mx-6">EXTRA 5% OFF PREPAID ORDERS</span>
                    <span className="mx-6">FREE SHIPPING ON ORDERS ABOVE ₹999</span>
                    <span className="mx-6">A TRY-ME SAMPLE FREE WITH EVERY ORDER</span>
                    <span className="mx-6">EXPLORE OUR NEWEST LAUNCHES</span>
                    <span className="mx-6">EXTRA 5% OFF PREPAID ORDERS</span>
                    <span className="mx-6">FREE SHIPPING ON ORDERS ABOVE ₹999</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-5 text-[10px] tracking-[0.15em] uppercase font-medium">
                  <Link href="/track-order" className="hover:text-white/80 transition-colors">Track Order</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main header row */}
        <div className={cn(
          "transition-all duration-500",
          isHomePage
            ? (isScrolled ? "bg-white/95 backdrop-blur-md" : "bg-transparent")
            : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-14 md:h-16 gap-4">

              {/* Mobile: Search icon left */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "md:hidden p-2 transition-colors rounded-full",
                  isHomePage && !isScrolled ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                )}
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
                      "h-10 w-auto object-contain transition-all duration-500",
                      isHomePage && !isScrolled ? "brightness-0 invert" : ""
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
                      "h-8 w-auto object-contain transition-all duration-500",
                      isHomePage && !isScrolled ? "brightness-0 invert" : ""
                    )}
                  />
                </Link>
              </div>

              {/* Desktop: Search bar center */}
              <div className="hidden md:flex flex-1 max-w-lg mx-6">
                <form onSubmit={handleSearch} className="w-full relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "w-full h-10 pl-4 pr-11 text-sm rounded-full transition-all duration-300 placeholder:text-gray-400",
                      isHomePage && !isScrolled
                        ? "bg-white/15 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:bg-white/25 focus:border-white/60"
                        : "bg-gray-100 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#14A8E6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(20,168,230,0.1)]"
                    )}
                  />
                  <button
                    type="submit"
                    className={cn(
                      "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full transition-all duration-300",
                      isHomePage && !isScrolled
                        ? "text-white/80 hover:text-white hover:bg-white/20"
                        : "text-gray-500 hover:text-[#14A8E6] hover:bg-[#14A8E6]/10"
                    )}
                  >
                    <IconSearch className="h-4 w-4" stroke={1.5} />
                  </button>
                </form>
              </div>

              {/* Right: Icons */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                {/* Desktop: User icon */}
                <div className="hidden sm:block">
                  <ClientOnly>
                    {isAuthenticated ? (
                      <Link
                        href="/account"
                        className={cn(
                          "p-2 transition-colors rounded-full relative",
                          isHomePage && !isScrolled
                            ? "text-white hover:bg-white/10"
                            : "text-gray-700 hover:text-[#14A8E6] hover:bg-[#14A8E6]/10"
                        )}
                        aria-label="Account"
                      >
                        <AvatarCircle name={user?.name} size="sm" />
                      </Link>
                    ) : (
                      <Link
                        href="/auth"
                        className={cn(
                          "p-2 transition-colors rounded-full",
                          isHomePage && !isScrolled
                            ? "text-white hover:bg-white/10"
                            : "text-gray-700 hover:text-[#14A8E6] hover:bg-[#14A8E6]/10"
                        )}
                        aria-label="Login"
                      >
                        <IconUser className="h-5 w-5" stroke={1.5} />
                      </Link>
                    )}
                  </ClientOnly>
                </div>

                {/* Wishlist */}
                <Link
                  href="/wishlist"
                  className={cn(
                    "p-2 transition-colors rounded-full relative",
                    isHomePage && !isScrolled
                      ? "text-white hover:bg-white/10"
                      : "text-gray-700 hover:text-[#14A8E6] hover:bg-[#14A8E6]/10"
                  )}
                  aria-label="Wishlist"
                >
                  <IconHeart className="h-5 w-5" stroke={1.5} />
                </Link>

                {/* Cart */}
                <ClientOnly>
                  <Link
                    href="/cart"
                    className={cn(
                      "p-2 transition-colors rounded-full relative",
                      isHomePage && !isScrolled
                        ? "text-white hover:bg-white/10"
                        : "text-gray-700 hover:text-[#14A8E6] hover:bg-[#14A8E6]/10"
                    )}
                    aria-label="Cart"
                  >
                    <IconShoppingBag className="h-5 w-5" stroke={1.5} />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center" style={{ background: "linear-gradient(135deg, #A458A6, #14A8E6)" }}>
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </ClientOnly>

                {/* Mobile: Menu */}
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className={cn(
                    "md:hidden p-2 transition-colors rounded-full",
                    isHomePage && !isScrolled ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100"
                  )}
                  aria-label="Menu"
                >
                  <IconMenu2 className="h-5 w-5" stroke={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Navigation menu below header */}
        <div className={cn(
          "hidden md:block transition-all duration-500 border-b",
          isHomePage
            ? (isScrolled ? "bg-white border-gray-100" : "bg-transparent border-white/10")
            : "bg-white border-gray-100"
        )}>
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <nav className="flex items-center justify-center gap-8 h-10">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-[11px] tracking-[0.2em] font-medium transition-all duration-300 relative py-2",
                    isHomePage && !isScrolled
                      ? cn("hover:text-white", pathname === href ? "text-white" : "text-white/80")
                      : cn("hover:text-[#14A8E6]", pathname === href ? "text-[#14A8E6]" : "text-gray-700")
                  )}
                >
                  {label}
                </Link>
              ))}
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
      <DialogContent className="sm:max-w-[500px] bg-white p-0 overflow-hidden border border-gray-200 rounded-2xl shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-center">
            <span className="font-semibold text-lg text-gray-900">Search Products</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6">
          <form onSubmit={handleSearch} className="relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#14A8E6]" stroke={1.5} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-11 pr-24 text-sm bg-gray-50 border-2 border-gray-200 rounded-full focus:outline-none focus:border-[#14A8E6] focus:shadow-[0_0_0_3px_rgba(20,168,230,0.1)] transition-all duration-300 placeholder:text-gray-400"
              autoComplete="off"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <IconX className="h-4 w-4" stroke={1.5} />
                </button>
              )}
              <button
                type="submit"
                className="h-8 px-4 text-white text-[10px] uppercase tracking-wider font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#14A8E6]/30"
                style={{ background: "#14A8E6" }}
              >
                Search
              </button>
            </div>
          </form>

          {categories.length > 0 && (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.2em] mb-3 text-gray-500 font-medium">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 10).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="px-3 py-1.5 text-[11px] tracking-wide border border-gray-200 rounded-full transition-all text-gray-600 hover:bg-[#14A8E6] hover:text-white hover:border-[#14A8E6]"
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[340px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <Image src="/logo.png" alt="Style Villa" width={100} height={40} className="h-9 w-auto object-contain" />
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
            <IconX className="h-5 w-5" stroke={1.5} />
          </button>
        </div>

        {/* User section */}
        <ClientOnly>
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0 bg-gray-50">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <AvatarCircle name={user?.name} size="lg" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth" className="flex-1" onClick={onClose}>
                  <button className="w-full h-10 text-xs font-semibold text-white rounded-full" style={{ background: "#A458A6" }}>
                    Sign In
                  </button>
                </Link>
                <Link href="/auth?tab=register" className="flex-1" onClick={onClose}>
                  <button className="w-full h-10 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>
        </ClientOnly>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center px-4 py-3 text-sm tracking-wide transition-colors",
                  pathname === href ? "text-[#A458A6] font-medium" : "text-gray-700 hover:text-[#A458A6]"
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 px-2">
              <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Categories</p>
              {categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-[#A458A6] transition-colors"
                >
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Account links */}
          <ClientOnly>
            {isAuthenticated && (
              <div className="mt-2 pt-2 border-t border-gray-100 px-2">
                <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Account</p>
                {[
                  { href: "/account", icon: IconUser, label: "Profile" },
                  { href: "/account/orders", icon: IconPackage, label: "My Orders" },
                  { href: "/account/addresses", icon: IconMapPin, label: "Addresses" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-[#A458A6] transition-colors"
                  >
                    <Icon className="h-4 w-4 text-gray-400" stroke={1.5} />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => { handleLogout(); onClose(); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <IconLogout className="h-4 w-4" stroke={1.5} />
                  Sign Out
                </button>
              </div>
            )}
          </ClientOnly>

          {/* Help links */}
          <div className="mt-2 pt-2 border-t border-gray-100 px-2">
            <p className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Help</p>
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
                className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[#A458A6] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="mx-3 mt-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <a href={`tel:${CONTACT.phone}`} className="flex items-center gap-2.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
              <IconPhone className="h-4 w-4 flex-shrink-0 text-gray-400" stroke={1.5} />
              {CONTACT.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
