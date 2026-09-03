import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  return (
    <footer className="border-t border-[#111111]/10 bg-[#faf7f4]">
      <Container className="grid gap-10 py-12 md:grid-cols-4">
        <div>
          <p className="text-xl font-black tracking-[0.18em] text-[#111111] uppercase">GIRA</p>
          <p className="mt-4 max-w-xs text-sm text-[#555555]">Playful shades for the city, the coast, and every in-between.</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#666666]">Navigate</p>
          <ul className="mt-4 space-y-3 text-sm text-[#333333]">
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#666666]">Support</p>
          <ul className="mt-4 space-y-3 text-sm text-[#333333]">
            <li><Link href="/shipping">Shipping</Link></li>
            <li><Link href="/faq">Returns</Link></li>
            <li><Link href="/faq">Care guide</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#666666]">Join</p>
          <p className="mt-4 text-sm text-[#333333]">Early access + insider drops.</p>
          <div className="mt-4 flex gap-2">
            <input aria-label="Email for newsletter" placeholder="Email address" className="h-11 flex-1 rounded-full border border-[#111111]/10 bg-white px-4 text-sm outline-none ring-0" />
            <button type="button" className="inline-flex h-11 items-center justify-center rounded-full bg-[#111111] px-4 text-sm font-medium text-white">Join</button>
          </div>
        </div>
      </Container>
      <div className="border-t border-[#111111]/10 py-4">
        <Container className="flex flex-col gap-2 text-sm text-[#666666] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 GIRA. All rights reserved.</p>
          <p>Made for your next moment.</p>
        </Container>
      </div>
    </footer>
  );
}
