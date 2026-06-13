import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchWishlist(1);
  }, [user]);

  const fetchWishlist = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/customer/wishlist", { params: { page } });
      setItems(res.data.data);
      setPagination({
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total,
      });
      setCurrentPage(res.data.page);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchWishlist(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemove = async (productId) => {
    try {
      await API.delete(`/customer/wishlist/${productId}`);
      setItems(prev => prev.filter(item => item.product_id !== productId));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (err) { console.error(err); }
  };

  const handleAddToCart = async (productId, itemId) => {
    setAddingToCart(itemId);
    try {
      await API.post("/customer/cart", { product_id: productId, quantity: 1 });
      await handleRemove(productId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>My Wishlist</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            {pagination.total} item{pagination.total !== 1 ? "s" : ""} saved
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: "#718096" }}>Loading wishlist...</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl p-16 text-center"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <p className="text-6xl mb-4">❤️</p>
            <p className="text-xl font-bold mb-2" style={{ color: "#1A0A2E" }}>Your wishlist is empty</p>
            <p className="text-sm mb-6" style={{ color: "#718096" }}>
              Save items you love by clicking the heart icon
            </p>
            <Link to="/products"
              className="inline-block px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)", textDecoration: "none" }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map(item => {
                const discount = item.original_price
                  ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
                  : 0;
                return (
                  <div key={item.id} className="rounded-2xl overflow-hidden transition hover:shadow-xl"
                    style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", transition: "all 0.2s ease" }}>

                    {/* Image */}
                    <div className="relative h-52 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/products/${item.slug}`)}
                      style={{ backgroundColor: "#F8F5FF" }}>
                      {item.primary_image ? (
                        <img src={item.primary_image} alt={item.name}
                          className="w-full h-full object-cover" />
                      ) : <span className="text-6xl opacity-30">📦</span>}
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold"
                          style={{ backgroundColor: "#C53030", color: "#ffffff" }}>
                          -{discount}%
                        </span>
                      )}
                      <button onClick={e => { e.stopPropagation(); handleRemove(item.product_id); }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                        style={{ backgroundColor: "rgba(255,255,255,0.9)" }}>
                        ❤️
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 cursor-pointer hover:underline"
                        onClick={() => navigate(`/products/${item.slug}`)}
                        style={{ color: "#1A0A2E" }}>
                        {item.name}
                      </h3>

                      {item.rating > 0 && (
                        <div className="flex mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className="text-xs"
                              style={{ color: star <= Math.round(item.rating) ? "#D4A017" : "#e2e8f0" }}>★</span>
                          ))}
                        </div>
                      )}

                      <p className="font-bold text-base mb-3" style={{ color: "#3B1F6E" }}>
                        ETB {parseFloat(item.price).toLocaleString()}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(item.product_id, item.id)}
                          disabled={addingToCart === item.id || item.stock === 0}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition hover:opacity-90"
                          style={{
                            background: item.stock === 0 ? "#A0AEC0"
                              : "linear-gradient(135deg, #D4A017, #B8860B)",
                            color: "#1A0A2E",
                            cursor: item.stock === 0 ? "not-allowed" : "pointer",
                          }}>
                          {addingToCart === item.id ? "Adding..."
                            : item.stock === 0 ? "Out of Stock"
                            : "🛒 Add to Cart"}
                        </button>
                        <button onClick={() => handleRemove(item.product_id)}
                          className="w-10 rounded-xl flex items-center justify-center transition hover:opacity-80"
                          style={{ backgroundColor: "#FFF5F5", border: "1px solid #FED7D7" }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={12}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}