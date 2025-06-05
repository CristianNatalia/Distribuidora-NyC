// src/pages/SobreNosotros.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function SobreNosotros() {
  return (
<div className="sobre-nosotros-container">
      <h1 className="sobre-nosotros-title">Sobre Nosotros</h1>
      <div className="sobre-nosotros-content">
        <p><MapPin className="icon" /> <strong>Dirección:</strong> Calle 82 ex J Hernández 6189 (1650) SAN MARTÍN- PROV.BS.AS.</p>
        <p><Mail className="icon" /> <strong>Email:</strong> <a href="mailto:ventasdistribuidoranyc@gmail.com">ventasdistribuidoranyc@gmail.com</a></p>
        <p><Phone className="icon" /> <strong>Teléfono:</strong> +54 9 11-5710-1911</p>
      </div>
      <Link to="/" className="volver-link">← Volver al inicio</Link>
    </div>
  );
}