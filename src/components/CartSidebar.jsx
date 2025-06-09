// src/components/CartSidebar.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function CartSidebar({ visible, onClose }) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [client, setClient] = useState({ nombre: '', telefono: '', email: '' });
  const [bonificacionCliente, setBonificacionCliente] = useState(0);
  const [bonificacionPago, setBonificacionPago] = useState(0);
  const [margen, setMargen] = useState(0);
  const IVA = 21; // fijo

  // 1) Subtotal base
  const subtotalBase = cart.reduce((sum, i) => {
    const price = i.offerPrice ?? i.price;
    return sum + price * i.quantity;
  }, 0);

  // 2) Descuentos sobre subtotal base
  const descuentoCliente = subtotalBase * bonificacionCliente / 100;
  const descuentoPago = (subtotalBase - descuentoCliente) * bonificacionPago / 100;
  const netoAntesIva = subtotalBase - descuentoCliente - descuentoPago;
  const ivaTotal = netoAntesIva * IVA / 100;
  const totalFinal = netoAntesIva + ivaTotal;

  const handleGenerate = () => {
    if (!client.nombre || !client.telefono || !client.email) {
      toast.error('Completá todos los campos');
      return;
    }
    try {
      const doc = new jsPDF();
      const now = new Date();
      const fecha = now.toLocaleDateString('es-AR');
      const hora = now.toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit', hour12: false
      });

      // Header
      doc.text('Presupuesto', 14, 20);
      doc.text(`Fecha: ${fecha} - ${hora} hs`, 14, 27);
      doc.text(`Cliente: ${client.nombre}`, 14, 34);
      doc.text(`Teléfono: ${client.telefono}`, 14, 41);
      doc.text(`Email: ${client.email}`, 14, 48);

      // === 1ª Tabla: Costos base y descuentos ===
      autoTable(doc, {
        startY: 56,
        head: [['Producto', 'Marca', 'Cant.', 'Precio Base', 'Subt. Base']],
        body: cart.map(i => {
          const base = i.offerPrice ?? i.price;
          return [
            i.name,
            i.brand,
            i.quantity,
            `$${base.toFixed(2)}`,
            `$${(base * i.quantity).toFixed(2)}`
          ];
        })
      });

      let y = doc.lastAutoTable.finalY + 10;
      doc.text(`Subtotal base: $${subtotalBase.toFixed(2)}`, 14, y);
      y += 7;
      doc.text(`Bonif. cliente (${bonificacionCliente}%): -$${descuentoCliente.toFixed(2)}`, 14, y);
      y += 7;
      doc.text(`Bonif. pago (${bonificacionPago}%): -$${descuentoPago.toFixed(2)}`, 14, y);
      y += 7;
      doc.text(`Neto sin IVA: $${netoAntesIva.toFixed(2)}`, 14, y);
      y += 7;
      doc.text(`IVA ${IVA}%: +$${ivaTotal.toFixed(2)}`, 14, y);
      y += 7;
      doc.text(`Total final: $${totalFinal.toFixed(2)}`, 14, y);

      // === 2ª Tabla: Precios de venta con margen ===
      doc.addPage();
      doc.text('Precios de Venta', 14, 16);
      autoTable(doc, {
        startY: 20,
        head: [['Producto', 'Marca', 'Cant.', 'Precio Base', 'Precio c/ Margen', 'Margen %', 'Subtotal']],
        body: cart.map(i => {
          const base = i.offerPrice ?? i.price;
          const venta = base * (1 + margen / 100);
          const subtotal = venta * i.quantity;
          return [
            i.name,
            i.brand,
            i.quantity,
            `$${base.toFixed(2)}`,
            `$${venta.toFixed(2)}`,
            `${margen}%`,
            `$${subtotal.toFixed(2)}`
          ];
        })
      });


      doc.save('presupuesto.pdf');
      toast.success('PDF generado');
      setShowForm(false);
    } catch (er) {
      console.error(er);
      toast.error('Error al generar PDF');
    }
  };

  return (
    <div className={`cart-sidebar ${visible ? 'open' : ''}`}>
      <div className="cart-header">
        <h2>Carrito</h2>
        <button className="cart-close-button" onClick={onClose}>✕</button>
      </div>

      {cart.length === 0 ? (
        <p className="cart-empty">El carrito está vacío.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map(i => (
              <li key={i.code} className="cart-item">
                <div className="cart-item-info">
                  <strong>{i.name}</strong>
                  <p>
                    Precio:{' '}
                    {i.offerPrice
                      ? <>
                        <strong>${i.offerPrice.toLocaleString()}</strong>{' '}
                        <span className="original-price">(${i.price.toLocaleString()})</span>
                      </>
                      : `$${i.price.toLocaleString()}`}
                  </p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(i.code, -1)}>-</button>
                    <span>{i.quantity}</span>
                    <button onClick={() => updateQuantity(i.code, +1)}>+</button>
                  </div>
                  <p>Subtotal: ${((i.offerPrice ?? i.price) * i.quantity).toFixed(2)}</p>
                </div>
                <button className="cart-button" onClick={() => removeFromCart(i.code)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          {!showForm ? (
            <div className="cart-footer">
              <div className="cart-actions">
                <button
                  className="clear-cart-button"
                  onClick={() => window.confirm('Vaciar carrito?') && clearCart()}>
                  🗑️
                </button>
                <div className="cart-total">
                  Total: <strong>${totalFinal.toFixed(2)}</strong>
                </div>
              </div>
              <button className="cart-generate-button" onClick={() => setShowForm(true)}>
                Generar presupuesto
              </button>
            </div>
          ) : (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Datos del cliente</h3>
                {['nombre', 'telefono', 'email'].map(f => (
                  <input
                    key={f}
                    name={f}
                    placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                    value={client[f]}
                    onChange={e => setClient({ ...client, [f]: e.target.value })}
                  />
                ))}
                <h3>Bonificaciones y ajustes</h3>
                <div className="modal-numeric-inputs">
                  <h4>Bonif. cliente (%)</h4>
                  <input type="number"
                    value={bonificacionCliente}
                    onChange={e => setBonificacionCliente(Number(e.target.value))}
                  />
                  <h4>Bonif. pago (%)</h4>
                  <input type="number"
                    value={bonificacionPago}
                    onChange={e => setBonificacionPago(Number(e.target.value))}
                  />
                  <h4>Margen (%)</h4>
                  <input type="number"
                    value={margen}
                    onChange={e => setMargen(Number(e.target.value))}
                  />
                  <h4>IVA (%)</h4>
                  <input type="number" value={IVA} readOnly />
                </div>
                <div className="modal-buttons">
                  <button onClick={() => setShowForm(false)} className="modal-cancel-button">
                    ← Volver
                  </button>
                  <button onClick={handleGenerate} className="modal-confirm-button">
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
