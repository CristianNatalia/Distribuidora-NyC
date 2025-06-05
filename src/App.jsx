// src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import SobreNosotros from './pages/SobreNosotros';
import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';

export default function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        </Routes>
      </CartProvider>
    </AdminProvider>
  );
}
