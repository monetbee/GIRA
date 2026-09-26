"use client";
import { useTranslations } from "@/components/providers/locale-provider";

import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
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
  const t = useTranslations();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const isProductPage = pathname?.startsWith("/products/") ?? false;

  return (
    <header className={`gira-header sticky top-0 z-50 ${isProductPage ? "gira-header-light" : ""}`}>
      <Container className="gira-header-inner flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="gira-menu-button inline-flex h-10 w-10 items-center justify-center md:hidden"
            aria-label={t("Open navigation menu")}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link href="/" className="gira-brand-lockup flex items-center gap-2.5">
            <span className="gira-mark" aria-hidden="true" />
            <span className="gira-brand-wordmark">GIRA</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label={t("Main navigation")}>
          {navItems.map((item) => (
            <Link key={item.id} href={item.href} className="gira-nav-link">
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/shop" className="hidden sm:inline-flex">
            <Button variant="secondary" size="sm" className="gira-header-cta">{t("Shop now")}</Button>
          </Link>
          <div className="gira-header-account-menu">
            <button
              type="button"
              className="gira-header-account inline-flex h-10 w-10 items-center justify-center"
              aria-label={t("Account")}
              aria-expanded={accountMenuOpen}
              aria-controls="gira-account-menu"
              onClick={() => setAccountMenuOpen((open) => !open)}
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </button>
            {accountMenuOpen ? (
              <div id="gira-account-menu" className="gira-header-account-popover" aria-label={t("Account")}>
                <p>GIRA CLUB</p>
                <Link href="/account" onClick={() => setAccountMenuOpen(false)}>MY ACCOUNT</Link>
                <Link href="/account/login?returnTo=/account" onClick={() => setAccountMenuOpen(false)}>JOIN / SIGN IN</Link>
              </div>
            ) : null}
          </div>
          <CartTrigger />
        </div>
      </Container>

      {menuOpen ? (
        <div className="gira-menu-panel md:hidden">
          <Container>
            <nav aria-label={t("Mobile navigation")} className="gira-mobile-nav py-3">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="gira-mobile-nav-link"
                >
                  {t(item.label)}
                </Link>
              ))}
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
