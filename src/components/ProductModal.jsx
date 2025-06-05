import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [offerPrice, setOfferPrice] = useState(""); // ✅ Estado del precio ofrecido

  const parsedOffer = parseFloat(offerPrice);
  const hasOffer = !isNaN(parsedOffer) && parsedOffer > 0;

  const handle = () => {
    if (qty < 1) return toast.error('Cantidad inválida');

    addToCart({
      code: product.Código,
      name: product.Descripción,
      price: Number(product.Precio),
      image: product['img url'],
      brand: product.Marca,
      quantity: qty,
      offerPrice: hasOffer ? parsedOffer : null // ✅ Se guarda solo si es válido
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{product.Descripción}</h2>
        <img src={product['img url']} alt="" className="modal-image" />
        <p>Marca: {product.Marca}</p>
        <p>Precio original: ${Number(product.Precio).toLocaleString()}</p>

        <label>Cantidad: </label>
        <input
          type="number"
          min="1"
          value={qty}
          onChange={e => setQty(Number(e.target.value))}
        />
        <br></br>
        <br></br>
        <label>Precio personalizado: </label>
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="Precio ofrecido"
          value={offerPrice}
          onChange={e => setOfferPrice(e.target.value)}
        /> 
        <br></br>
        <br></br>

        <button onClick={handle} className="modal-button add-button">
          Añadir al carrito
        </button>
        <button onClick={onClose} className="modal-button close-button">
          Cerrar
        </button>
      </div>
    </div>
  );
}
