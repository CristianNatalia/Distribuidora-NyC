import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    //localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = item => {
    setCart(prev => {
      const exists = prev.find(i => i.code === item.code);
      if (exists) {
        return prev.map(i =>
          i.code === item.code
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    toast.success('Producto añadido al carrito');
  };

  const removeFromCart = code => {
    setCart(prev => prev.filter(i => i.code !== code));
    toast.success('Producto eliminado');
  };

  const updateQuantity = (code, delta) => {
    setCart(prev =>
      prev.map(i =>
        i.code === code ? { ...i, quantity: Math.max(i.quantity + delta, 1) } : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Carrito vaciado');
  };

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
