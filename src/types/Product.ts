export interface Product {
  Marca: string;
  Código: string;
  Descripción: string;
  Precio: string; // puede venir como texto desde el CSV
  ['img url']?: string; // en caso de que no siempre venga
}
