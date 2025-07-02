import { fetchSheetCsv } from './sheetCsvService';
import { Product } from '../types/Product';

const SHEET_ID = '1-wniwV6J0BtIf-80p7X5n82BRwx8vRH8QCCP4_rMHjI';
const GID_PRODUCTOS = '953397673';
const GID_ESTADO = '348154381';

let allProducts: Product[] = [];
let productsByBrand: Map<string, Product[]> = new Map();
let hiddenBrands: Set<string> = new Set();

export async function loadAllProducts() {
  // Primero cargamos el estado de visibilidad general por marca
  const estadoRows = await fetchSheetCsv(SHEET_ID, GID_ESTADO);
  hiddenBrands = new Set(
    estadoRows
      .filter(r => (r.Mostrar?.trim().toLowerCase() || 'si') === 'no')
      .map(r => r.Marca?.trim() || '')
  );

  // Luego cargamos los productos y aplicamos ambas lógicas:
  const csvRows = await fetchSheetCsv(SHEET_ID, GID_PRODUCTOS);

  allProducts = csvRows
    .filter(row => {
      const mostrar = row['Mostrar']?.trim().toLowerCase();
      const marca = row['Marca']?.trim() || '';
      return mostrar !== 'no' && !hiddenBrands.has(marca);
    })
    .map(row => ({
      Marca: row['Marca']?.trim() || '',
      Código: row['Código']?.trim() || '',
      Descripción: row['Descripción']?.trim() || '',
      Precio: row['Precio']?.replace(',', '.') || '0',
      Imagen: row['img url'] || '',
    }));

  // Agrupar por marca
  productsByBrand = new Map();
  for (const p of allProducts) {
    if (!productsByBrand.has(p.Marca)) productsByBrand.set(p.Marca, []);
    productsByBrand.get(p.Marca)!.push(p);
  }
}

export function getAllProducts() {
  return allProducts;
}

export function getProductsByBrand(brand: string) {
  return productsByBrand.get(brand) || [];
}

export function getAllBrands() {
  return Array.from(productsByBrand.keys());
}

export function getHiddenBrands() {
  return hiddenBrands;
}
