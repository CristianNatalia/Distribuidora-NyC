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
  const [IVA, setIva] = useState(21); // ahora controlado por select

  //const [preciosPersonalizados, setPreciosPersonalizados] = useState(false);
  let preciosPersonalizados = false;


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

  // 3) Cálculos alternativos sin aplicar ofertas (para comparar)
  const subtotalOriginal = cart.reduce((sum, i) => {
    const price = i.price;
    return sum + price * i.quantity;
  }, 0);


  const descuentoClienteOriginal = subtotalOriginal * bonificacionCliente / 100;
  const descuentoPagoOriginal = (subtotalOriginal - descuentoClienteOriginal) * bonificacionPago / 100;
  const netoAntesIvaOriginal = subtotalOriginal - descuentoClienteOriginal - descuentoPagoOriginal;
  const ivaOriginal = netoAntesIvaOriginal * IVA / 100;
  const totalOriginal = netoAntesIvaOriginal + ivaOriginal;

  // Diferencia entre precios finales
  const diferencia = totalOriginal - totalFinal;


  const handleGenerate = () => {
    if (!client.nombre || !client.telefono || !client.email) {
      toast.error('Completá todos los campos');
      return;
    }
    if (subtotalOriginal != subtotalBase) {
      preciosPersonalizados = true;
      console.log("true")
    }
    else {
      preciosPersonalizados = false;
      console.log("falso")
    }
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica');
      const now = new Date();
      const fecha = now.toLocaleDateString('es-AR');
      const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

      // Header principal
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Presupuesto Comercial', 14, 20);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Fecha: ${fecha} - ${hora} hs`, 14, 28);
      doc.text(`Cliente: ${client.nombre}`, 14, 36);
      doc.text(`Teléfono: ${client.telefono}`, 14, 43);
      doc.text(`Email: ${client.email}`, 14, 50);

      // Línea divisoria
      doc.setDrawColor(200);
      doc.line(14, 54, 200, 54);

      // Tabla de productos
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text('Detalle de productos (precios sin IVA)', 14, 62);

      autoTable(doc, {
        startY: 66,
        head: [['Producto', 'Marca', 'Cant.', 'Precio Lista', 'Oferta', 'Subtotal']],
        body: cart.map(i => {
          const base = i.price;
          const oferta = i.offerPrice;
          const precioUsado = oferta ?? base;
          return [
            i.name,
            i.brand,
            i.quantity,
            `$${base.toFixed(2)}`,
            oferta ? `$${oferta.toFixed(2)}` : '-',
            `$${(precioUsado * i.quantity).toFixed(2)}`
          ];
        }),
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: 20,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      let y = doc.lastAutoTable.finalY + 10;

      const addSummaryLine = (label, value, bold = false) => {
        doc.setFont(undefined, bold ? 'bold' : 'normal');
        doc.text(`${label} $${value.toFixed(2)}`, 14, y);
        y += 7;
      };

      // Resumen de totales
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Resumen de cálculo', 14, y);
      y += 7;

      addSummaryLine(`Subtotal original (usando ofertas si hay):`, subtotalBase);
      addSummaryLine(`Descuento por cliente (${bonificacionCliente}%): -`, descuentoCliente);
      addSummaryLine(`Descuento por forma de pago (${bonificacionPago}%): -`, descuentoPago);
      addSummaryLine(`Neto antes de IVA:`, netoAntesIva);
      addSummaryLine(`IVA (${IVA}%): +`, ivaTotal);
      addSummaryLine(`Total final con IVA:`, totalFinal, true);

      if (preciosPersonalizados == true) {
        y += 7;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Cálculo con los precios originales', 14, y);
        y += 7;
        addSummaryLine(`Subtotal original (usando los precios originales):`, subtotalOriginal);
        addSummaryLine(`Descuento por cliente (${bonificacionCliente}%): -`, descuentoClienteOriginal);
        addSummaryLine(`Descuento por forma de pago (${bonificacionPago}%): -`, descuentoPagoOriginal);
        addSummaryLine(`Neto antes de IVA:`, netoAntesIvaOriginal);
        addSummaryLine(`IVA (${IVA}%): +`, ivaTotal);
        addSummaryLine(`Total final con IVA:`, totalOriginal, true);
      }

      y += 5;
      doc.setDrawColor(200);
      doc.line(14, y, 200, y);
      y += 10;

      // Comparación con precios originales
      doc.setFont(undefined, 'bold');
      doc.text('Comparativa con precios sin oferta', 14, y);
      y += 7;
      doc.setFont(undefined, 'normal');
      addSummaryLine(`Total con precios ofrecidos:`, totalFinal);
      addSummaryLine(`Total con precios originales:`, totalOriginal);
      addSummaryLine(`Diferencia total por ofertas: -`, diferencia);

      // Página 2
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Precios de venta sugeridos con margen aplicado', 14, 20);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`(Calculados sobre precios con oferta si corresponde, con margen del ${margen}%)`, 14, 26);

      autoTable(doc, {
        startY: 32,
        head: [['Producto', 'Marca', 'Cant.', 'Precio', 'Precio + Margen', 'Margen', 'Subtotal']],
        body: cart.map(i => {
          const base = i.price;
          const oferta = i.offerPrice;
          const precioUsado = oferta ?? base;
          const venta = precioUsado * (1 + margen / 100);
          const subtotal = venta * i.quantity;
          return [
            i.name,
            i.brand,
            i.quantity,
            `$${precioUsado.toFixed(2)}`,
            `$${venta.toFixed(2)}`,
            `${margen}%`,
            `$${subtotal.toFixed(2)}`
          ];
        }),
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [210, 230, 255],
          textColor: 20,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
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
                  <select value={IVA} onChange={e => setIva(Number(e.target.value))}>
                    <option value={21}>21%</option>
                    <option value={10.5}>10,5%</option>
                  </select>

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
