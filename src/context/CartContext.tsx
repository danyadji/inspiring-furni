"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, CartContextType } from "@/types/cart";

const CART_STORAGE_KEY = "inspiring_furni_cart_v1";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // LocalStorage access failure fallback
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // LocalStorage save failure fallback
      }
    }
  }, [items, isLoaded]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  const addItem = (newItem: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.variationId === newItem.variationId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const currentItem = updated[existingIndex];
        if (currentItem) {
          updated[existingIndex] = {
            ...currentItem,
            quantity: currentItem.quantity + quantity,
          };
        }
        return updated;
      }

      return [...prev, { ...newItem, quantity }];
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (productId: number, variationId: number) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variationId === variationId)
      )
    );
  };

  const updateQuantity = (productId: number, variationId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variationId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variationId === variationId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalCount,
        isLoaded,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
