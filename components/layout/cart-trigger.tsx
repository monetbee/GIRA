"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";

export function CartTrigger() {
  const { isOpen, openCart, itemCount } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Open cart"
      aria-expanded={isOpen}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#111111]/10 bg-white text-[#111111] transition-colors hover:bg-[#f6f6f6]"
    >
      <ShoppingBag className="h-4 w-4" />
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff5f6d] px-1 text-[10px] font-bold text-white">
          {itemCount}
        </span>
      ) : null}
    </button>
  );
}
