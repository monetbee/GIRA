"use client";
import { useTranslations } from "@/components/providers/locale-provider";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  variantId,
  quantity = 1,
  className,
  disabled = false,
}: {
  variantId: string;
  quantity?: number;
  className?: string;
  disabled?: boolean;
}) {
  const t = useTranslations();
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    console.log("ADD_TO_CART_CLICKED", { variantId: variantId ? "present" : "missing" });
    if (!variantId || disabled) return;
    setIsAdding(true);
    try {
      await addItem(variantId, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (error) {
      console.error("ADD_TO_CART_FAILED", error instanceof Error ? error.message : error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Button
      type="button"
      variant={added ? "secondary" : "primary"}
      className={`w-full gap-2 sm:w-auto ${className ?? ""}`.trim()}
      onClick={handleAdd}
      disabled={isAdding || disabled}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {disabled ? t("SOLD OUT") : isAdding ? t("Adding...") : added ? t("Added") : t("Add to cart")}
    </Button>
  );
}
