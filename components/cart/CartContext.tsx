"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Product } from "../../client/services/products";
import type { CartItem, CartState } from "./cartTypes";
import {
  cartItemCount,
  cartLineCount,
  clearCartStorage,
  emitCartUpdate,
  getCartSnapshot,
  getEmptyCart,
  saveCartToStorage,
  subscribeToCart,
} from "./cartStorage";

function key(id: Product["id"]) {
  return String(id);
}

function applyCartAction(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const k = key(action.product.id);
      const existing = state.items[k];
      return {
        items: {
          ...state.items,
          [k]: {
            product: action.product,
            quantity: (existing?.quantity ?? 0) + 1,
            note: existing?.note,
          },
        },
      };
    }
    case "setQty": {
      const k = key(action.productId);
      const existing = state.items[k];
      if (!existing) return state;
      if (action.quantity <= 0) {
        const { [k]: _removed, ...rest } = state.items;
        return { items: rest };
      }
      return {
        items: {
          ...state.items,
          [k]: { ...existing, quantity: action.quantity },
        },
      };
    }
    case "remove": {
      const k = key(action.productId);
      const { [k]: _removed, ...rest } = state.items;
      return { items: rest };
    }
    case "clear":
      return getEmptyCart();
    default:
      return state;
  }
}

type CartAction =
  | { type: "add"; product: Product }
  | { type: "setQty"; productId: Product["id"]; quantity: number }
  | { type: "remove"; productId: Product["id"] }
  | { type: "clear" };

type CartContextValue = {
  items: CartItem[];
  lineCount: number;
  pieceCount: number;
  add(product: Product): void;
  setQty(productId: Product["id"], quantity: number): void;
  remove(productId: Product["id"]): void;
  clear(): void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getEmptyCart
  );

  const commit = useCallback((next: CartState) => {
    saveCartToStorage(next);
    emitCartUpdate();
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const items = Object.values(cart.items);
    return {
      items,
      lineCount: cartLineCount(cart),
      pieceCount: cartItemCount(cart),
      add: (product) => commit(applyCartAction(cart, { type: "add", product })),
      setQty: (productId, quantity) =>
        commit(applyCartAction(cart, { type: "setQty", productId, quantity })),
      remove: (productId) =>
        commit(applyCartAction(cart, { type: "remove", productId })),
      clear: () => {
        clearCartStorage();
        emitCartUpdate();
      },
    };
  }, [cart, commit]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
