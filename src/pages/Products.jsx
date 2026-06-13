import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

function ProductCard({ product, wishlistIds, onWishlistToggle }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
  const isWished = wishlistIds.includes(product.id);

  return (
    <div className="rounded-2xl overflow-hidden cursor-pointer transition hover:shadow-xl hover:-translate-y-1 group relative"
      style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", transition: "all 0.2s ease" }}>

      {/* Wishlist Button */}
      <button
        onClick={e => { e.stopPropagation(); onWishlistToggle(product.id); }}
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10 transition hover:scale-110"
        style={{ backgroundColor: "rgba(255,255,255,0.9)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <span style={{ color: isWished ? "#C53030" : "#A0AEC0" }}>{isWished ? "❤️" : "🤍"}</span>
      </button>

      {/* Image */}
      <div className="relative h-52 flex items-center justify-center overflow-hidden"
        onClick={() => navigate(`/products/${product.slug}`)}
        style={{ backgroundColor: "#F8F5FF" }}>
        {product.primary_image ? (
          <img src={product.primary_image} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-6xl opacity-30">📦</span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: "#C53030", color: "#ffffff" }}>
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4" onClick={() => navigate(`/products/${product.slug}`)}>
        {product.brand && (
          <p className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: "#5A2D9C" }}>{product.brand}</p>
        )}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2" style={{ color: "#1A0A2E" }}>
          {product.name}
        </h3>
        {product.total_reviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className="text-xs"
                style={{ color: star <= Math.round(product.rating) ? "#D4A017" : "#e2e8f0" }}>★</span>
            ))}
            <span className="text-xs ml-1" style={{ color: "#718096" }}>({product.total_reviews})</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-lg" style={{ color: "#3B1F6E" }}>
              ETB {parseFloat(product.price).toLocaleString()}
            </p>
            {product.original_price && (
              <p className="text-xs line-through" style={{ color: "#A0AEC0" }}>
                ETB {parseFloat(product.original_price).toLocaleString()}
              </p>
            )}
          </div>
          <span className="text-xs" style={{ color: "#718096" }}>{product.sold} sold</span>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const params = new URLSearchParams(location.search);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: params.get("search") || "",
    category: params.get("category") || "",
    min_price: "",
    max_price: "",
    sort: params.get("sort") || "",
  });

  useEffect(() => {
    fetchCategories();
    if (user) fetchWishlist();
  }, [user]);

  useEffect(() => {
    fetchProducts(1);
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/products", { params: { ...filters, page } });
      setProducts(res.data.data);
      setPagination({ page: res.data.page, totalPages: res.data.totalPages, total: res.data.total });
      setCurrentPage(res.data.page);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/customer/wishlist");
      setWishlistIds(res.data.map(w => w.product_id));
    } catch (err) { console.error(err); }
  };

  const handleWishlistToggle = async (productId) => {
    if (!user) { navigate("/login"); return; }
    try {
      if (wishlistIds.includes(productId)) {
        await API.delete(`/customer/wishlist/${productId}`);
        setWishlistIds(prev => prev.filter(id => id !== productId));
      } else {
        await API.post("/customer/wishlist", { product_id: productId });
        setWishlistIds(prev => [...prev, productId]);
      }
    } catch (err) { console.error(err); }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const SORT_OPTIONS = [
    { value: "", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Best Selling" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
  ];

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />

      {/* Header */}
      <section style={{ background: "linear-gradient(135deg, #3B1F6E 0%, #5A2D9C 100%)" }}
        className="py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            {filters.category
              ? categories.find(c => c.slug === filters.category)?.name || "Products"
              : filters.search ? `Results for "${filters.search}"` : "All Products"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)" }}>
            {pagination.total} products found
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-8">

        {/* Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="rounded-2xl p-5 sticky top-24"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold" style={{ color: "#1A0A2E" }}>Filters</h3>
              <button
                onClick={() => setFilters({ search: "", category: "", min_price: "", max_price: "", sort: "" })}
                className="text-xs font-semibold"
                style={{ color: "#5A2D9C" }}>
                Clear all
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#718096" }}>
                Category
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setFilters({ ...filters, category: "" })}
                  className="text-left text-sm px-3 py-2 rounded-xl transition"
                  style={{
                    backgroundColor: !filters.category ? "#3B1F6E" : "transparent",
                    color: !filters.category ? "#ffffff" : "#4A5568",
                  }}>
                  All Categories
                </button>
                {categories.map(cat => (
                  <button key={cat.id}
                    onClick={() => setFilters({ ...filters, category: cat.slug })}
                    className="text-left text-sm px-3 py-2 rounded-xl transition"
                    style={{
                      backgroundColor: filters.category === cat.slug ? "#3B1F6E" : "transparent",
                      color: filters.category === cat.slug ? "#ffffff" : "#4A5568",
                    }}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#718096" }}>
                Price Range (ETB)
              </p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min"
                  value={filters.min_price}
                  onChange={e => setFilters({ ...filters, min_price: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ border: "1px solid #e2e8f0", backgroundColor: "#F8F5FF", color: "#1A0A2E" }}
                  onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                <input type="number" placeholder="Max"
                  value={filters.max_price}
                  onChange={e => setFilters({ ...filters, max_price: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ border: "1px solid #e2e8f0", backgroundColor: "#F8F5FF", color: "#1A0A2E" }}
                  onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#718096" }}>
                Sort By
              </p>
              <div className="flex flex-col gap-1.5">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => setFilters({ ...filters, sort: opt.value })}
                    className="text-left text-sm px-3 py-2 rounded-xl transition"
                    style={{
                      backgroundColor: filters.sort === opt.value ? "#3B1F6E" : "transparent",
                      color: filters.sort === opt.value ? "#ffffff" : "#4A5568",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: "#718096" }}>
              Showing <strong>{products.length}</strong> of <strong>{pagination.total}</strong> products
            </p>
            {/* Mobile sort */}
            <select
              value={filters.sort}
              onChange={e => setFilters({ ...filters, sort: e.target.value })}
              className="lg:hidden px-3 py-2 rounded-xl text-sm outline-none"
              style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#1A0A2E" }}>
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-20" style={{ color: "#718096" }}>Loading products...</div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl p-16 text-center"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-bold text-lg mb-2" style={{ color: "#1A0A2E" }}>No products found</p>
              <p className="text-sm mb-4" style={{ color: "#718096" }}>Try different filters or search terms</p>
              <button
                onClick={() => setFilters({ search: "", category: "", min_price: "", max_price: "", sort: "" })}
                className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map(product => (
                  <ProductCard key={product.id} product={product}
                    wishlistIds={wishlistIds}
                    onWishlistToggle={handleWishlistToggle} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={pagination.totalPages}
                onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}