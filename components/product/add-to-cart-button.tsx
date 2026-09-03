"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ variantId, quantity = 1 }: { variantId: string; quantity?: number }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (!variantId) return;
    setIsAdding(true);
    await addItem(variantId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    setIsAdding(false);
  };

  return (
    <Button
      type="button"
      variant={added ? "secondary" : "primary"}
      className="w-full gap-2 sm:w-auto"
      onClick={handleAdd}
      disabled={isAdding}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {isAdding ? "Adding..." : added ? "Added" : "Add to cart"}
    </Button>
  );
}
