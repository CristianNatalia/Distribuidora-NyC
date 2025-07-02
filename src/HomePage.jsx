// src/HomePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import BrandSelector from './components/BrandSelector';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartSidebar from './components/CartSidebar';
import { useCart } from './context/CartContext';
import { Link } from 'react-router-dom';
import { getAllProducts, getProductsByBrand, loadAllProducts } from './services/sheetManager';
import logo from './assets/logo cristian3.png';
import { generateProductPdf } from './utils/pdfGenerator';
import { generateProductExcel } from './utils/excelGenerator';

export default function HomePage() {
  const [selectedBrand, setSelectedBrand] = useState('ACEITEX');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hiddenBrands, setHiddenBrands] = useState(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const [searchScope, setSearchScope] = useState("brand");
  const [searchTerm, setSearchTerm] = useState("");

  const { cart } = useCart();
  const [currentPage, setCurrentPage] = useState(0);
  const PRODUCTS_PER_PAGE = 50;
  

  useEffect(() => {
    setLoading(true);
    loadAllProducts()
      .then(() => setDataLoaded(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!dataLoaded || !selectedBrand) return;
    setLoading(true);
    try {
      const data = getProductsByBrand(selectedBrand);
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, dataLoaded]);

  const filteredProducts = useMemo(() => {
    if (!dataLoaded || !searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    if (searchScope === "global") {
      const all = getAllProducts();
      return all.filter(p =>
        p.Descripción?.toLowerCase().includes(term) ||
        p.Código?.toLowerCase().includes(term)
      );
    } else {
      return products.filter(p =>
        p.Descripción?.toLowerCase().includes(term) ||
        p.Código?.toLowerCase().includes(term)
      );
    }
  }, [searchTerm, searchScope, products, dataLoaded]);

  const handleSelect = (brand) => {
    setSelectedBrand(brand);
    setSearchScope("brand");
    setSearchTerm("");
    setCurrentPage(0);
    setIsSidebarVisible(false);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, searchScope]);

  const paginatedProducts = useMemo(() => {
    const start = currentPage * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  const handleDownloadPdf = () => {
    setShowDownloadOptions(true);
  };

  // PDF – Todos
  const handleDownloadAll = () => {
    const all = getAllProducts();
    generateProductPdf(all);
    setShowDownloadOptions(false);
  };
  // PDF – Marca actual
  const handleDownloadSelectedBrand = () => {
    const brandProducts = getProductsByBrand(selectedBrand);
    generateProductPdf(brandProducts, selectedBrand);
    setShowDownloadOptions(false);
  };

  // XLSX – Todos
  const handleDownloadAllExcel = () => {
    const all = getAllProducts();
    generateProductExcel(all);
    setShowDownloadOptions(false);
  };
  // XLSX – Marca actual
  const handleDownloadSelectedBrandExcel = () => {
    const brandProducts = getProductsByBrand(selectedBrand);
    generateProductExcel(brandProducts, selectedBrand);
    setShowDownloadOptions(false);
  };

  useEffect(() => {
    if (showDownloadOptions) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDownloadOptions]);

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <img src={logo} alt="Logo empresa" className="logo-empresa" />
        <h1 className="company-name">Distribuidora N&C</h1>
        <nav className="nav-links">
          <Link to="/sobre-nosotros">Sobre nosotros</Link>
        </nav>
        <div
          className="cart-icon-container"
          aria-label="Abrir carrito"
          role="button"
          tabIndex={0}
          onClick={() => setCartOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
          {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
        </div>
      </header>

      <div className="search-bars">
        <div className="search-bar">
          <input
            type="text"
            placeholder={`Buscar en ${searchScope === "global" ? "todos los productos" : "la marca actual"}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={searchScope}
            onChange={(e) => setSearchScope(e.target.value)}
          >
            <option value="brand">Marca actual</option>
            <option value="global">Todos los productos</option>
          </select>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")}>✖️</button>
          )}
        </div>
        {loading ? (
          <p></p>
        ) : (
          <button
            className="download-pdf-button"
            onClick={handleDownloadPdf}
          >
            Descargar productos en PDF / XLSX
          </button>
        )}
      </div>

      <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
        <span className="btn-text">MARCAS</span>
        <svg
          className={`toggle-icon ${isSidebarVisible ? 'rotated' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          width="18"
          height="18"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="app-container">
        {isSidebarVisible && (
          <aside className="sidebar">
            <h2 className="sidebar-title">Marcas</h2>
            <BrandSelector
              selected={selectedBrand}
              onSelect={handleSelect}
              hiddenBrands={hiddenBrands}
              toggleHidden={(brand) => {
                setHiddenBrands(h => {
                  const copy = new Set(h);
                  copy.has(brand) ? copy.delete(brand) : copy.add(brand);
                  return copy;
                });
              }}
            />
          </aside>
        )}

        <main className="main-content">
          <h1 className="main-title">
            {searchScope === "global" && searchTerm
              ? 'Resultados globales'
              : `Productos de ${selectedBrand}`}
          </h1>

          {loading ? (
            <p>Cargando…</p>
          ) : (
            <div className="product-grid">
              {paginatedProducts
                .filter(p => !hiddenBrands.has(p.Marca))
                .map(item => (
                  <ProductCard
                    key={item.Código}
                    product={item}
                    onClick={() => setSelectedProduct(item)}
                    selectedBrand={selectedBrand}
                  />
                ))}
            </div>
          )}

          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
              disabled={currentPage === 0}
            >
              ← Anterior
            </button>

            <span>Página {currentPage + 1} de {Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)}</span>

            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={(currentPage + 1) * PRODUCTS_PER_PAGE >= filteredProducts.length}
            >
              Siguiente →
            </button>
          </div>
        </main>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          selectedBrand={selectedBrand}
        />
      )}

      {showDownloadOptions && (
        <div
          className="modal-pdf-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-pdf-overlay')) {
              setShowDownloadOptions(false);
            }
          }}
        >
          <div className="modal-pdf-content animate-fade-in">
            <button className="modal-pdf-close-btn" onClick={() => setShowDownloadOptions(false)}>✖</button>
            <h2>¿Qué deseas descargar?</h2>
            <div className="modal-pdf-buttons">
              {/* PDF */}
              <button className="modal-pdf-btn" onClick={handleDownloadAll}>
                📦 PDF - Todos los productos
              </button>
              <button className="modal-pdf-btn" onClick={handleDownloadSelectedBrand}>
                🏷️ PDF - Solo {selectedBrand}
              </button>

              {/* XLSX */}
              <button className="modal-pdf-btn btn-excel" onClick={handleDownloadAllExcel}>
                📦 XLSX - Todos los productos
              </button>
              <button className="modal-pdf-btn btn-excel" onClick={handleDownloadSelectedBrandExcel}>
                🏷️ XLSX - Solo {selectedBrand}
              </button>

              <button className="modal-pdf-btn cancel" onClick={() => setShowDownloadOptions(false)}>
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <CartSidebar visible={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}