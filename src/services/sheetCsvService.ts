import Papa from 'papaparse';
import { Product } from '../types/Product';

export async function fetchSheetCsv(sheetId: string, gid: string): Promise<Product[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url);
  const csvText = await res.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data as Product[];
}
