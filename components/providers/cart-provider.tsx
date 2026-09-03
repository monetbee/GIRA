"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addCartLines,
  createCart,
  getCart,
  removeCartLine,
  updateCartLine,
  type ShopifyCart,
} from "@/lib/shopify-client";

const CART_STORAGE_KEY = "gira-cart-id";

type CartContextValue = {
  cart: ShopifyCart | null;
  cartId: string | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItemQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  itemCount: number;
  isReady: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const syncCart = useCallback(async (nextCartId?: string | null) => {
    const activeCartId = nextCartId ?? cartId ?? localStorage.getItem(CART_STORAGE_KEY);
    if (!activeCartId) {
      setCart(null);
      setIsReady(true);
      return;
    }

    const nextCart = await getCart(activeCartId);
    if (nextCart) {
      setCart(nextCart);
      setCartId(nextCart.id);
      localStorage.setItem(CART_STORAGE_KEY, nextCart.id);
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
      setCart(null);
      setCartId(null);
    }

    setIsReady(true);
  }, [cartId]);

  useEffect(() => {
    const storedCartId = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCartId) {
      void syncCart(storedCartId);
      return;
    }

    setIsReady(true);
  }, [syncCart]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    if (!variantId) return;

    let activeCartId = cartId ?? localStorage.getItem(CART_STORAGE_KEY);

    if (!activeCartId) {
      const createdCart = await createCart();
      if (!createdCart) return;

      activeCartId = createdCart.id;
      setCartId(createdCart.id);
      localStorage.setItem(CART_STORAGE_KEY, createdCart.id);
      setCart(createdCart);
    }

    const nextCart = await addCartLines(activeCartId, variantId, quantity);
    if (nextCart) {
      setCart(nextCart);
      setCartId(nextCart.id);
      localStorage.setItem(CART_STORAGE_KEY, nextCart.id);
    }

    setIsOpen(true);
  }, [cartId]);

  const updateItemQuantity = useCallback(async (lineId: string, quantity: number) => {
    if (!cartId || !lineId) return;
    const nextCart = await updateCartLine(cartId, lineId, quantity);
    if (nextCart) {
      setCart(nextCart);
    }
  }, [cartId]);

  const removeItem = useCallback(async (lineId: string) => {
    if (!cartId || !lineId) return;
    const nextCart = await removeCartLine(cartId, lineId);
    if (nextCart) {
      setCart(nextCart);
    }
  }, [cartId]);

  const itemCount = useMemo(() => cart?.totalQuantity ?? 0, [cart]);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    cartId,
    isOpen,
    openCart,
    closeCart,
    addItem,
    updateItemQuantity,
    removeItem,
    itemCount,
    isReady,
  }), [cart, cartId, isOpen, openCart, closeCart, addItem, updateItemQuantity, removeItem, itemCount, isReady]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
