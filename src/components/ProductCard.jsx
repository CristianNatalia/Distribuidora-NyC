// src/components/ProductCard.jsx
import React from 'react';

export default function ProductCard({ product, onClick }) {
  return (
    <div className="product-card" onClick={onClick}>
      <img src={product['img url']? product['img url']: product.Imagen} alt={product.Descripción} />
      <div className="product-name">{product.Descripción}</div>
      <div className="product-price">${Number(product.Precio).toLocaleString()}</div>
    </div>
  );
}
