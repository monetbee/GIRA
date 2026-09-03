"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { cart, updateItemQuantity, removeItem } = useCart();

  return (
    <main className="py-12 md:py-16">
      <Container className="max-w-4xl">
        <h1 className="text-5xl font-black tracking-[-0.08em] text-[#111111]">Your bag.</h1>
        {cart && cart.lines.nodes.length > 0 ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {cart.lines.nodes.map((line) => (
                <div key={line.id} className="rounded-[24px] border border-[#111111]/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">{line.merchandise.title}</p>
                      <p className="mt-1 text-sm text-[#666666]">{formatPrice(line.cost.amountPerQuantity)}</p>
                    </div>
                    <button type="button" onClick={() => removeItem(line.id)} className="text-sm font-medium text-[#666666] underline-offset-4 hover:underline">
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full border border-[#111111]/10 px-2 py-1">
                      <button type="button" className="h-6 w-6 text-lg" onClick={() => updateItemQuantity(line.id, Math.max(0, line.quantity - 1))} aria-label="Decrease quantity">−</button>
                      <span className="min-w-6 text-center text-sm font-medium">{line.quantity}</span>
                      <button type="button" className="h-6 w-6 text-lg" onClick={() => updateItemQuantity(line.id, line.quantity + 1)} aria-label="Increase quantity">+</button>
                    </div>
                    <p className="text-base font-semibold text-[#111111]">{formatPrice(line.cost.amountPerQuantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-[#111111]/10 bg-white p-6">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">Summary</p>
              <div className="mt-6 space-y-3 text-sm text-[#333333]">
                <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatPrice(cart.cost.subtotalAmount)}</span></div>
                <div className="flex items-center justify-between"><span>Shipping</span><span>Calculated at checkout</span></div>
              </div>
              <Link href={cart.checkoutUrl} target="_blank" rel="noreferrer" className="mt-6 block">
                <Button className="w-full">Checkout</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border border-dashed border-[#111111]/15 bg-white p-8 text-center">
            <p className="text-xl font-semibold text-[#111111]">Your bag is empty</p>
            <p className="mt-2 text-base text-[#666666]">Add a pair of shades to complete the look.</p>
            <Link href="/shop" className="mt-6 inline-block">
              <Button>Continue shopping</Button>
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}
