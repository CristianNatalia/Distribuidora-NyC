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

  const subtotal = cart.reduce((sum, i) => sum + (i.offerPrice ?? i.price) * i.quantity, 0);
  const bonificacionTotal = (subtotal * (bonificacionCliente + bonificacionPago)) / 100;
  const margenTotal = ((subtotal - bonificacionTotal) * margen) / 100;
  const ivaTotal = ((subtotal - bonificacionTotal + margenTotal) * IVA) / 100;
  const totalFinal = subtotal - bonificacionTotal + margenTotal + ivaTotal;

  const handleGenerate = () => {
    if (!client.nombre || !client.telefono || !client.email) {
      return toast.error('Completá todos los campos');
    }
    try {
      const doc = new jsPDF();
      const now = new Date();
      const fecha = now.toLocaleDateString('es-AR');
      const hora = now.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      doc.text('Presupuesto', 14, 20);
      doc.text(`Fecha: ${fecha} - ${hora} hs`, 14, 27);
      doc.text(`Nombre: ${client.nombre}`, 14, 34);
      doc.text(`Teléfono: ${client.telefono}`, 14, 41);
      doc.text(`Email: ${client.email}`, 14, 48);

      const totalOriginal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const ahorro = totalOriginal - totalFinal;

      autoTable(doc, {
        startY: 56,
        head: [['Producto', 'Marca', 'Cant.', 'Precio', 'Subtotal']],
        body: cart.map(i => {
          const unitPriceStr = i.offerPrice
            ? `$${i.offerPrice.toLocaleString()} (Orig: $${i.price.toLocaleString()})`
            : `$${i.price.toLocaleString()}`;

          const subtotal = (i.offerPrice ?? i.price) * i.quantity;
          const subtotalStr = `$${subtotal.toFixed(2)}` +
            (i.offerPrice ? ` (Orig: $${(i.price * i.quantity).toFixed(2)})` : '');

          return [
            i.name,
            i.brand,
            i.quantity,
            unitPriceStr,
            subtotalStr
          ];
        })
      });

      let finalY = doc.lastAutoTable.finalY + 10;
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 14, finalY);
      doc.text(`Bonificación cliente: -$${((subtotal * bonificacionCliente) / 100).toFixed(2)} (${bonificacionCliente}%)`, 14, finalY + 7);
      doc.text(`Bonificación por pago: -$${((subtotal * bonificacionPago) / 100).toFixed(2)} (${bonificacionPago}%)`, 14, finalY + 14);
      doc.text(`Margen aplicado: +$${margenTotal.toFixed(2)} (${margen}%)`, 14, finalY + 21);
      doc.text(`IVA: +$${ivaTotal.toFixed(2)} (21%)`, 14, finalY + 28);
      doc.text(`Total final: $${totalFinal.toFixed(2)}`, 14, finalY + 35);

      if (ahorro > 0) {
        doc.text(`Ahorro estimado: $${ahorro.toFixed(2)}`, 14, finalY + 42);
      }

      doc.save('presupuesto.pdf');
      toast.success('PDF generado');
      setShowForm(false);
    } catch (er) {
      toast.error('Error al generar PDF');
      console.log(er);
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
                  <p>
                    Subtotal: $ {(i.quantity * (i.offerPrice ?? i.price)).toFixed(2)}
                  </p>
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
                <h4><strong>Dirección:</strong> Calle 82 ex J Hernández 6189 (1650) SAN MARTÍN- PROV.BS.AS.</h4>
                <h4><strong>Email:</strong> <a href="mailto:ventasdistribuidoranyc@gmail.com">ventasdistribuidoranyc@gmail.com</a></h4>
                <h4><strong>Teléfono:</strong> +54 9 11-5710-1911</h4>
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
                  <h4><strong>Bonificación cliente (%)</strong></h4>
                  <input
                    type="number"
                    value={bonificacionCliente}
                    onChange={e => setBonificacionCliente(Number(e.target.value))}
                  />
                  <h4><strong>Bonificación por pago (%)</strong></h4>
                  <input
                    type="number"
                    value={bonificacionPago}
                    onChange={e => setBonificacionPago(Number(e.target.value))}
                  />
                  <h4><strong>Margen (%)</strong></h4>
                  <input
                    type="number"
                    value={margen}
                    onChange={e => setMargen(Number(e.target.value))}
                  />
                  <h4><strong>IVA (%)</strong></h4>
                  <select>
                    <option value={IVA}>{IVA}</option>
                  </select>
                </div>
                <br/>
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
