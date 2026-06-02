"use client";

import React, { createContext, useContext, useMemo, useReducer } from "react";
import type { Product } from "../../client/services/products";
import type { CartItem, CartState } from "./cartTypes";

type Action =
  | { type: "add"; product: Product }
  | { type: "setQty"; productId: Product["id"]; quantity: number }
  | { type: "remove"; productId: Product["id"] }
  | { type: "clear" };

function key(id: Product["id"]) {
  return String(id);
}

function reducer(state: CartState, action: Action): CartState {
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
      return { items: {} };
    default:
      return state;
  }
}

type CartContextValue = {
  items: CartItem[];
  add(product: Product): void;
  setQty(productId: Product["id"], quantity: number): void;
  remove(productId: Product["id"]): void;
  clear(): void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: {} });

  const value = useMemo<CartContextValue>(() => {
    const items = Object.values(state.items);
    return {
      items,
      add: (product) => dispatch({ type: "add", product }),
      setQty: (productId, quantity) =>
        dispatch({ type: "setQty", productId, quantity }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

