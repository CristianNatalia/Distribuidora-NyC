// src/utils/excelGenerator.js
import * as XLSX from 'xlsx';

// Genera y dispara descarga de un archivo .xlsx. 
// Si `products` es un listado de todas las marcas, crea una hoja por cada Marca.
// Si `products` viene filtrado por marca (p.ej. solo “ACEITEX”), genera un único sheet.
export function generateProductExcel(products, customName = "Productos") {
    // Crea libro (workbook)
    const wb = XLSX.utils.book_new();

    if (customName === "TODOS") {
        // Agrupamos todos los productos por Marca
        const byBrand = products.reduce((acc, prod) => {
            const m = prod.Marca || "SIN_MARCA";
            if (!acc[m]) acc[m] = [];
            acc[m].push(prod);
            return acc;
        }, {});

        // Por cada Marca, creamos un sheet con sus productos
        Object.entries(byBrand).forEach(([marca, listado]) => {
            const safeName = marca.replace(/[:\\\/\?\*\[\]]/g, "").substring(0, 31);

            // Mapear a objetos planos para XLSX
            const data = listado.map((p) => ({
                Marca: p.Marca,
                Código: p.Código,
                Descripción: p.Descripción,
                Precio: parseFloat(p.Precio),
            }));
            const ws = XLSX.utils.json_to_sheet(data, { header: ["Marca", "Código", "Descripción", "Precio"] });
            // Ajustes mínimos de ancho de columnas (opcional)
            const wsCols = [
                { wch: 20 }, // Marca
                { wch: 15 }, // Código
                { wch: 50 }, // Descripción
                { wch: 12 }, // Precio
            ];
            ws["!cols"] = wsCols;
            XLSX.utils.book_append_sheet(wb, ws, safeName.substring(0, 31)); // nombre máximo 31 chars
        });
    } else {
        // Solo una Marca: usamos products directamente
        const data = products.map((p) => ({
            Marca: p.Marca,
            Código: p.Código,
            Descripción: p.Descripción,
            Precio: parseFloat(p.Precio),
        }));
        const ws = XLSX.utils.json_to_sheet(data, { header: ["Marca", "Código", "Descripción", "Precio"] });
        ws["!cols"] = [
            { wch: 20 },
            { wch: 15 },
            { wch: 50 },
            { wch: 12 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, customName.substring(0, 31));
    }

    // Generar el binary y disparar descarga
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${customName}_productos.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
}
