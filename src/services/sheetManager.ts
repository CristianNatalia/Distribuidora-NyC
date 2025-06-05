import { fetchSheetCsv } from './sheetCsvService';
import { Product } from '../types/Product';

const SHEET_ID = '1-wniwV6J0BtIf-80p7X5n82BRwx8vRH8QCCP4_rMHjI';
const GID_PRODUCTOS = '953397673';

let allProducts: Product[] = [];
let productsByBrand: Map<string, Product[]> = new Map();

export async function loadAllProducts() {
  const csvRows = await fetchSheetCsv(SHEET_ID, GID_PRODUCTOS);
  
  allProducts = csvRows.map((row) => ({
    Marca: row['Marca']?.trim() || '',
    Código: row['Código']?.trim() || '',
    Descripción: row['Descripción']?.trim() || '',
    Precio: row['Precio']?.replace(',', '.') || '0',
    Imagen: row['img url'] || '',
  }));

  // Agrupar productos por marca
  productsByBrand = new Map();
  for (const product of allProducts) {
    if (!productsByBrand.has(product.Marca)) {
      productsByBrand.set(product.Marca, []);
    }
    productsByBrand.get(product.Marca)?.push(product);
  }
}

export function getAllProducts(): Product[] {
  return allProducts;
}

export function getProductsByBrand(brand: string): Product[] {
  return productsByBrand.get(brand) || [];
}

export function getAllBrands(): string[] {
  return Array.from(productsByBrand.keys());
}
