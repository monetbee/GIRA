"use client";
import { useTranslations } from "@/components/providers/locale-provider";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const t = useTranslations();
  const { cart, isOpen, closeCart, updateItemQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/30">
      <aside className="gira-cart ml-auto flex h-full w-full max-w-md flex-col bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 pb-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#666666]">{t("Your bag")}</p>
            <h2 className="text-2xl font-black tracking-[-0.06em] text-[#111111]">{t("Cart")}</h2>
          </div>
          <button type="button" onClick={closeCart} aria-label={t("Close cart")} className="gira-cart-close inline-flex items-center justify-center rounded-full">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex-1 space-y-4 overflow-y-auto">
          {cart?.lines?.nodes && cart.lines.nodes.length > 0 ? (
            cart.lines.nodes.map((line) => (
              <div key={line.id} className="flex gap-3 border-b border-[#111111]/10 pb-4">
                {line.merchandise.image ? (
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f3f3f3]">
                    <Image src={line.merchandise.image.url} alt={line.merchandise.image.altText || line.merchandise.title} fill className="object-cover" sizes="80px" />
                  </div>
                ) : null}
                <div className="min-w-0 flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">{line.merchandise.title}</p>
                      <p className="mt-1 text-xs text-[#666666]">{t("Qty {quantity}", { quantity: line.quantity })}</p>
                    </div>
                    <button type="button" onClick={() => removeItem(line.id)} className="gira-cart-remove text-xs font-medium">{t("Remove")}</button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="gira-cart-quantity">
                      <button type="button" onClick={() => updateItemQuantity(line.id, Math.max(0, line.quantity - 1))} aria-label={t("Decrease quantity for {title}", { title: line.merchandise.title })}>
                        −
                      </button>
                      <span className="min-w-6 text-center text-sm font-medium">{line.quantity}</span>
                      <button type="button" onClick={() => updateItemQuantity(line.id, line.quantity + 1)} aria-label={t("Increase quantity for {title}", { title: line.merchandise.title })}>
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-[#111111]">{formatPrice(line.cost.amountPerQuantity)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-[#111111]/15 bg-[#f9f9f9] p-6 text-center">
              <p className="text-lg font-semibold text-[#111111]">{t("Your bag is empty")}</p>
              <p className="mt-2 text-sm text-[#666666]">{t("Add a pair of shades to keep the mood going.")}</p>
            </div>
          )}
        </div>

        {cart && cart.lines.nodes.length > 0 ? (
          <div className="mt-5 space-y-4 border-t border-[#111111]/10 pt-4">
            <div className="flex items-center justify-between text-sm text-[#666666]">
              <span>{t("Subtotal")}</span>
              <span>{formatPrice(cart.cost.subtotalAmount)}</span>
            </div>
            <Link href={cart.checkoutUrl} target="_blank" rel="noreferrer" className="gira-cart-action w-full">
              {t("Checkout")}
            </Link>
          </div>
        ) : (
          <Button type="button" onClick={closeCart} className="mt-5 w-full shrink-0">{t("Continue shopping")}</Button>
        )}
      </aside>
    </div>
  );
}
