import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import type { CartItem, Product } from "../types";

const STORAGE_KEY = "namma-basket-cart";

type CartStateValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
};

type CartActionsValue = {
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartStateContext = createContext<CartStateValue | undefined>(undefined);
const CartActionsContext = createContext<CartActionsValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item._id === product._id);

      if (existing) {
        return current.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item._id !== productId);
      }

      return current.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const stateValue = useMemo<CartStateValue>(
    () => ({
      items,
      totalItems,
      subtotal
    }),
    [items, subtotal, totalItems]
  );

  const actionsValue = useMemo<CartActionsValue>(
    () => ({
      addToCart,
      updateQuantity,
      clearCart
    }),
    [addToCart, clearCart, updateQuantity]
  );

  return (
    <CartStateContext.Provider value={stateValue}>
      <CartActionsContext.Provider value={actionsValue}>{children}</CartActionsContext.Provider>
    </CartStateContext.Provider>
  );
}

export function useCartState() {
  const context = useContext(CartStateContext);

  if (!context) {
    throw new Error("useCartState must be used within CartProvider");
  }

  return context;
}

export function useCartActions() {
  const context = useContext(CartActionsContext);

  if (!context) {
    throw new Error("useCartActions must be used within CartProvider");
  }

  return context;
}

export function useCart() {
  const state = useCartState();
  const actions = useCartActions();

  return useMemo(
    () => ({
      ...state,
      ...actions
    }),
    [actions, state]
  );
  };
