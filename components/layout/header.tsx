"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CartTrigger } from "@/components/layout/cart-trigger";

const navItems = [
  { id: "shop", label: "Shop", href: "/shop" },
  { id: "new-drop", label: "New Drop", href: "/shop" },
  { id: "story", label: "Story", href: "/about" },
  { id: "faq", label: "FAQ", href: "/faq" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isProductPage = pathname?.startsWith("/products/") ?? false;

  return (
    <header className={`gira-header sticky top-0 z-50 ${isProductPage ? "gira-header-light" : ""}`}>
      <Container className="gira-header-inner flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="gira-menu-button inline-flex h-10 w-10 items-center justify-center md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link href="/" className="gira-brand-lockup flex items-center gap-2.5">
            <span className="gira-mark" aria-hidden="true" />
            <span className="gira-brand-wordmark">GIRA</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href} className="gira-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/shop" className="hidden sm:inline-flex">
            <Button variant="secondary" size="sm" className="gira-header-cta">Shop now</Button>
          </Link>
          <CartTrigger />
        </div>
      </Container>

      {menuOpen ? (
        <div className="gira-menu-panel md:hidden">
          <Container>
            <nav aria-label="Mobile navigation" className="py-3">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-[#f5f1eb]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
