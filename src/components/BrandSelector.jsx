// src/components/BrandSelector.jsx
import React from 'react';
import { useState } from 'react';

const BRANDS = ['ACEITEX', 'ACINDAR', 'ACINDAR-ALAMBRES', 'ALIGAS', 'ALNAT-ACOPLES RAPIDOS', 'AMBAR-HILO DE POLIPROPILENO', 'ANEMI', 'ANTARTIDA', 'ARS PLASTIC', 'ARTICULOS DE GOMA-PLASTICOS VS', 'ATITAN', 'BADEMA', 'BALDES DE ALBANIL PLASTICOS', 'BARBERO', 'BARBERO-IMPORTACION', 'BARBIJO (EXCELENTE CALIDAD)', 'BOLSAS-WORLDPLAS S.A', 'BOTAS DAMALU (USD)', 'BOTIN DE SEGURIDAD FIORE', "BREMEN", 'CABOS.', 'CALABRO',
  'CARBIZ', 'CAUCHET-PRODUCTOS QUIMICOS', 'CERAMICRUZ', 'CI-MURAT', 'CINTA DE PELIGRO', 'CINTA DE PERSIANA CL', 'CIOCCA-(MATERIALES ELECTRICOS)', 'CIOCCA-MATERIALES ELECTRICOS', 'CLAVO CABEZA DE PLOMO', 'COMET', 'CONOMETAL-PIRAMIDE', 'CORVEX', 'CRECCHIO-PRECINTOS', 'CUZCO', 'DAG', 'DE LUCA (CLAVOS)', 'DIBAPLAST', 'DOBLE A', 'DOBLE A - DISCOS DE CORTE', 'DUKE', 'DUKE -IMPORTADO EN PESOS.', 'DUKU (ARCOS SEPARADORES Y CUNA', 'EL ABUELO', 'EL ESCUERZO', 'EL TALA', 'ESCALERAS METALICAS NEW VAL', 'ESCALERAS TARARIRA', 'EVEL', 'EVOLUTION-NEON-ROTWEILLER', 'EXTENDER MP', 'EXTRAPOL S.A ( EX C-H)', 'EZETA', 'EZETA - AR LARGA COD.1200', 'EZETA AR-DECIMALES', 'EZETA-MECHAS CONICAS', 'EZETA-MECHAS SDS PLUS', 'EZETA-MECHAS VASTAGO REDUCIDO', 'F-P MAQUINAS DE SALPICAR', 'F.3', 'FAM-HASTA AGOTAR STOCK', 'FERCAS', 'FERRIMEX', 'FG-METALURGICA', 'FIELTRO FRATACHO', 'FORD', 'FORD (LANZAMIENTO FEBRERO 2017', 'FORTEX-ADHESIVOS S.R.L', 'FRATACHOS', 'FREPLAST-MANGUERA RIEGO-PVC-PR', 'GASSMANN-TERMOFUSORAS', 'GHERARDI', 'GRAN PRESION', 'GUANTES', 'HASTA AGOTAR STOCK', 'ITEPA S.A', 'IZAJES-IMPORTACION', 'J-R CLIPS P.BATERIA-PINZA MAZA', 'K-10', 'KLEBER-SIERRAS Y DISCOS', 'KUWAIT', 'LA ESPERANZA (HILOS Y SOGAS)', 'LA ESPERANZA (TANZA USD)', 'LA HACENDOSA- VIRUTA,TANZA', 'LLUSA', 'MACHETE', 'MAGICLICK', 'MARCAFACIL', 'MATA-RAT', 'MDG PRODUCTOS ELECTRICOS', 'MEMBRANA AUTOADHESIVA', 'METALURGICA ALVAREZ', 'MOISES', 'MOISES CABOS', 'MONKOTO', 'MOR (ESCALERAS DE ALUMINIO) EN', 'MULTICADENAS', 'MULTIMAXI', 'N.C.D', 'NAVEGANTE', 'NEIKE', 'OPTIMO', 'PAPAGNO (CAJAS DE HERRAMIENTAS', 'PARTS S.A', 'PENETRIT', 'PERROTTA', 'PINAS', 'PLASTICOS EL PARQUE', 'PLASTICOS FLOMAR', 'PLASTIRRABIT', 'PLASTIRRABIT IMPORTADO', 'POLIETILENO Y FILM STRETCH', 'POLITEN (TENDEDEROS)', 'POP-ARGENRAP', 'PREGO (GRIFERIA)', 'PROTEGER', 'PY FIJACIONES S.A', 'RAKETA', 'RE-FLEX (CABLES ELECTRICOS)', 'RE-PLAST (CAJAS PLASTICAS)', 'REJAS Y TAPAS AC.INOX.C.MARCO', 'ROA', 'ROLLS', 'ROOLS-P.REBAJADOS 40 % HASTA A', 'ROSARPIN', 'ROTTWEILER DISCOS Y SIERRAS', 'RUEDAS DE GOMA Y PLASTICAS', 'SABATINO', 'SANOGAS', 'SANTA JUANA', 'SANTORO', 'SAVICAR', 'SC-METALURGICA', 'SCOGAR', 'SECADORES ETERNO', 'SEGUGOMA', 'SEGURIDAD INDUSTRIAL', 'SILVER SHADOW (CAJASGAVETEROS', 'SIN PAR', 'SIPAR-CLAVOS', 'SOLYON (EN PESOS)', 'SOLYON (USD)', 'STOP', 'T.M.L.H', 'TABYPLAST', 'TACO-LATEX', 'TACSA (DOLARIZADO)', 'TALLERES FUMACA', 'TANZA-GRILLON (USD)', 'TAPABOCAS', 'TEJIDOS HEXAGONALES', 'TOOL MEN', 'TOR (ENROLLADORES Y TORNIQUETE', 'TORIANO', 'TOTH', 'TYROLIT', 'TYROLIT-BASIC', 'TYROLIT-XPERT TOOLS', 'UHU ADHESIVOS', 'URBAN FRESH', 'VARIOS', 'VIGGO - SOPORTES PARA LED', 'VIRGA', 'VOLT (HERRAMIENTAS ELECTRICAS)', 'VOLT (LANZAMIENTO 2017) H.ELEC', 'Z.H'];

export default function BrandSelector({
  selected, onSelect,
  hiddenBrands = new Set(),
}) {
  const [search, setSearch] = useState('');

  const handleSelect = (brand) => {
    onSelect(brand);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtrar marcas por texto de bÃºsqueda
  const filteredBrands = BRANDS.filter(b =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="brand-selector">
      <input
        type="text"
        placeholder="Buscar marca..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="brand-search-input"
      />
      <ul className="brand-list">
        {filteredBrands.map(b => {
          const isHidden = hiddenBrands.has(b);
          return (
            <li
              key={b}
              className={`brand-item ${selected === b ? 'active' : ''} ${isHidden ? 'hidden' : ''}`}
              onClick={() => !isHidden && onSelect(b)}
              style={{
                textDecoration: isHidden ? 'line-through' : 'none',
                cursor: isHidden ? 'default' : 'pointer',
                opacity: isHidden ? 0.5 : 1
              }}
            >
              {b}
            </li>
          );
        })}
      </ul>
    </div>
  );
}