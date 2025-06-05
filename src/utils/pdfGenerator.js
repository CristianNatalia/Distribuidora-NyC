// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateProductPdf(products, customName="TODOS") {
  const doc = new jsPDF();

  const tableData = products.map(product => [
    product.Marca,
    product.Código,
    product.Descripción,
    `$${parseFloat(product.Precio).toFixed(2)}`
  ]);

  doc.text(`Listado de ${customName} Productos`, 14, 16);
  autoTable(doc, {
    startY: 20,
    head: [['Marca', 'Código', 'Descripción', 'Precio']],
    body: tableData,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 14, right: 14 }
  });

  doc.save(`${customName} productos.pdf`);
}
