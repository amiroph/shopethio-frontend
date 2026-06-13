import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMsg, setCartMsg] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/products/${slug}`);
      setProduct(res.data);
      if (user) {
        const wRes = await API.get("/customer/wishlist");
        setIsWished(wRes.data.some(w => w.product_id === res.data.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    setAddingToCart(true);
    setCartMsg("");
    try {
      await API.post("/customer/cart", { product_id: product.id, quantity });
      setCartMsg("✅ Added to cart!");
      setTimeout(() => setCartMsg(""), 3000);
    } catch (err) {
      setCartMsg("❌ " + (err.response?.data?.message || "Failed to add"));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate("/login"); return; }
    await handleAddToCart();
    navigate("/cart");
  };

  const handleWishlistToggle = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      if (isWished) {
        await API.delete(`/customer/wishlist/${product.id}`);
        setIsWished(false);
      } else {
        await API.post("/customer/wishlist", { product_id: product.id });
        setIsWished(true);
      }
    } catch (err) { console.error(err); }
  };

  const discount = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  if (loading) return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "#718096" }}>Loading product...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "#718096" }}>Product not found.</p>
      </div>
    </div>
  );

  const images = product.images?.length > 0
    ? product.images
    : [{ image_url: null }];

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "#718096" }}>
          <Link to="/" style={{ color: "#5A2D9C", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <Link to="/products" style={{ color: "#5A2D9C", textDecoration: "none" }}>Products</Link>
          {product.category_name && (
            <>
              <span>/</span>
              <Link to={`/products?category=${product.category_slug}`}
                style={{ color: "#5A2D9C", textDecoration: "none" }}>
                {product.category_name}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: "#1A0A2E" }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">

          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="rounded-2xl overflow-hidden mb-4 flex items-center justify-center"
              style={{ height: "420px", backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
              {images[selectedImage]?.image_url ? (
                <img src={images[selectedImage].image_url} alt={product.name}
                  className="w-full h-full object-contain p-4" />
              ) : (
                <span className="text-9xl opacity-20">📦</span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition"
                    style={{
                      border: `2px solid ${i === selectedImage ? "#5A2D9C" : "#e2e8f0"}`,
                      backgroundColor: "#ffffff",
                    }}>
                    {img.image_url ? (
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl opacity-30 flex items-center justify-center h-full">📦</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {product.brand && (
              <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "#5A2D9C" }}>
                {product.brand}
              </p>
            )}
            <h1 className="text-2xl font-bold mb-3" style={{ color: "#1A0A2E" }}>
              {product.name}
            </h1>

            {/* Rating */}
            {product.total_reviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} style={{ color: star <= Math.round(product.rating) ? "#D4A017" : "#e2e8f0" }}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm" style={{ color: "#718096" }}>
                  {parseFloat(product.rating).toFixed(1)} ({product.total_reviews} reviews)
                </span>
                <span className="text-sm" style={{ color: "#A0AEC0" }}>
                  · {product.sold} sold
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-4 mb-6 p-4 rounded-2xl"
              style={{ backgroundColor: "#F8F5FF" }}>
              <p className="text-3xl font-bold" style={{ color: "#3B1F6E" }}>
                ETB {parseFloat(product.price).toLocaleString()}
              </p>
              {product.original_price && (
                <>
                  <p className="text-lg line-through mb-1" style={{ color: "#A0AEC0" }}>
                    ETB {parseFloat(product.original_price).toLocaleString()}
                  </p>
                  <span className="px-2 py-1 rounded-lg text-sm font-bold mb-1"
                    style={{ backgroundColor: "#C53030", color: "#ffffff" }}>
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: product.stock > 0 ? "#48BB78" : "#FC8181" }} />
              <span className="text-sm font-semibold"
                style={{ color: product.stock > 0 ? "#276749" : "#C53030" }}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
              </span>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-5">
                <p className="text-sm font-semibold" style={{ color: "#1A0A2E" }}>Quantity:</p>
                <div className="flex items-center rounded-xl overflow-hidden"
                  style={{ border: "1px solid #e2e8f0" }}>
                  <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold transition hover:opacity-80"
                    style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E" }}>−</button>
                  <span className="w-12 text-center font-bold" style={{ color: "#1A0A2E" }}>{quantity}</span>
                  <button onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold transition hover:opacity-80"
                    style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E" }}>+</button>
                </div>
              </div>
            )}

            {/* Cart message */}
            {cartMsg && (
              <div className="text-sm px-4 py-3 rounded-xl mb-4"
                style={{
                  backgroundColor: cartMsg.includes("✅") ? "#F0FFF4" : "#FFF5F5",
                  color: cartMsg.includes("✅") ? "#276749" : "#C53030",
                  border: `1px solid ${cartMsg.includes("✅") ? "#9AE6B4" : "#FED7D7"}`,
                }}>
                {cartMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mb-5">
              <button onClick={handleAddToCart} disabled={addingToCart || product.stock === 0}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm transition hover:opacity-90"
                style={{
                  background: product.stock === 0 ? "#A0AEC0" : "linear-gradient(135deg, #3B1F6E, #5A2D9C)",
                  color: "#ffffff",
                  cursor: product.stock === 0 ? "not-allowed" : "pointer",
                }}>
                {addingToCart ? "Adding..." : "🛒 Add to Cart"}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="flex-1 py-3.5 rounded-xl font-bold text-sm transition hover:opacity-90"
                style={{
                  background: product.stock === 0 ? "#A0AEC0" : "linear-gradient(135deg, #D4A017, #B8860B)",
                  color: "#1A0A2E",
                  cursor: product.stock === 0 ? "not-allowed" : "pointer",
                }}>
                ⚡ Buy Now
              </button>
              <button onClick={handleWishlistToggle}
                className="w-14 rounded-xl flex items-center justify-center text-xl transition hover:opacity-80"
                style={{
                  backgroundColor: isWished ? "#FFF5F5" : "#F8F5FF",
                  border: `1px solid ${isWished ? "#FED7D7" : "#e2e8f0"}`,
                }}>
                {isWished ? "❤️" : "🤍"}
              </button>
            </div>

            {/* Delivery Info */}
            <div className="rounded-2xl p-4 flex flex-col gap-3"
              style={{ backgroundColor: "#F8F5FF", border: "1px solid #e2e8f0" }}>
              {[
                { icon: "🚚", text: "Free delivery on orders over ETB 500" },
                { icon: "🔄", text: "30-day easy returns" },
                { icon: "🔒", text: "Secure payment via Chapa" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="text-sm" style={{ color: "#4A5568" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Description */}
            <div className="rounded-2xl p-7"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: "#1A0A2E" }}>Product Description</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#4A5568" }}>
                {product.description || "No description available."}
              </p>
            </div>

            {/* Reviews */}
            <div className="rounded-2xl p-7"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <h2 className="text-lg font-bold mb-5" style={{ color: "#1A0A2E" }}>
                Customer Reviews ({product.total_reviews})
              </h2>
              {product.reviews?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">⭐</p>
                  <p className="font-semibold" style={{ color: "#1A0A2E" }}>No reviews yet</p>
                  <p className="text-sm mt-1" style={{ color: "#718096" }}>
                    Be the first to review this product
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {product.reviews.map(review => (
                    <div key={review.id} className="pb-5 border-b last:border-0"
                      style={{ borderColor: "#e2e8f0" }}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                          style={{ backgroundColor: "#5A2D9C" }}>
                          {review.user_avatar ? (
                            <img src={review.user_avatar} alt={review.user_name} className="w-full h-full object-cover" />
                          ) : review.user_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#1A0A2E" }}>{review.user_name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className="text-xs"
                                  style={{ color: star <= review.rating ? "#D4A017" : "#e2e8f0" }}>★</span>
                              ))}
                            </div>
                            <span className="text-xs" style={{ color: "#A0AEC0" }}>
                              {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm leading-relaxed ml-12" style={{ color: "#4A5568" }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Summary Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl p-5"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <h3 className="font-bold mb-4" style={{ color: "#1A0A2E" }}>Product Details</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Category", value: product.category_name },
                  { label: "Brand", value: product.brand },
                  { label: "Stock", value: `${product.stock} units` },
                  { label: "Total Sold", value: `${product.sold} units` },
                  { label: "Rating", value: `${parseFloat(product.rating).toFixed(1)} / 5.0` },
                ].filter(item => item.value).map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ backgroundColor: "#F8F5FF" }}>
                    <p className="text-xs font-semibold" style={{ color: "#718096" }}>{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: "#1A0A2E" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="rounded-2xl p-5"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <h3 className="font-bold mb-3" style={{ color: "#1A0A2E" }}>Share This Product</h3>
              <div className="flex gap-2">
                {["📘 Facebook", "🐦 Twitter", "📱 Telegram"].map(s => (
                  <button key={s}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition hover:opacity-80"
                    style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E", border: "1px solid #e2e8f0" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}