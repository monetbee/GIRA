import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CartTrigger } from "@/components/layout/cart-trigger";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections/sun-essentials" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#111111]/10 bg-white/80 backdrop-blur-xl">
      <Container className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#111111]/10 md:hidden" aria-label="Open navigation menu">
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/" className="text-xl font-black tracking-[0.18em] text-[#111111] uppercase">
            GIRA
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-[#3a3a3a] transition-colors hover:text-[#111111]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/shop" className="hidden sm:inline-flex">
            <Button variant="secondary" size="sm">Shop now</Button>
          </Link>
          <CartTrigger />
        </div>
      </Container>
    </header>
  );
}
