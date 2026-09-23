"use client";
import { useTranslations } from "@/components/providers/locale-provider";

import Link from "next/link";
import { useCart } from "@/components/providers/cart-provider";
import { Container } from "@/components/ui/container";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const t = useTranslations();
  const { cart, updateItemQuantity, removeItem } = useCart();

  return (
    <main className="gira-cart py-12 md:py-16">
      <Container className="max-w-4xl">
        <h1 className="text-5xl font-black tracking-[-0.08em] text-[#111111]">{t("Your bag.")}</h1>
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
                    <button type="button" onClick={() => removeItem(line.id)} className="gira-cart-remove text-sm font-medium">{t("Remove")}</button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <div className="gira-cart-quantity">
                      <button type="button" onClick={() => updateItemQuantity(line.id, Math.max(0, line.quantity - 1))} aria-label={t("Decrease quantity")}>−</button>
                      <span className="min-w-6 text-center text-sm font-medium">{line.quantity}</span>
                      <button type="button" onClick={() => updateItemQuantity(line.id, line.quantity + 1)} aria-label={t("Increase quantity")}>+</button>
                    </div>
                    <p className="text-base font-semibold text-[#111111]">{formatPrice(line.cost.amountPerQuantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-[#111111]/10 bg-white p-6">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#666666]">{t("Summary")}</p>
              <div className="mt-6 space-y-3 text-sm text-[#333333]">
                <div className="flex items-center justify-between"><span>{t("Subtotal")}</span><span>{formatPrice(cart.cost.subtotalAmount)}</span></div>
                <div className="flex items-center justify-between"><span>{t("Shipping")}</span><span>{t("Calculated at checkout")}</span></div>
              </div>
              <Link href={cart.checkoutUrl} target="_blank" rel="noreferrer" className="gira-cart-action mt-6 w-full">
                {t("Checkout")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border border-dashed border-[#111111]/15 bg-white p-8 text-center">
            <p className="text-xl font-semibold text-[#111111]">{t("Your bag is empty")}</p>
            <p className="mt-2 text-base text-[#666666]">{t("Add a pair of shades to complete the look.")}</p>
            <Link href="/shop" className="gira-cart-action mt-6">
              {t("Continue shopping")}
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
}
