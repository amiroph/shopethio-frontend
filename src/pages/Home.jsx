import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HERO_SLIDES = [
  {
    title: "Premium Electronics",
    subtitle: "Latest phones, laptops & gadgets",
    cta: "Shop Electronics",
    link: "/products?category=electronics",
    bg: "linear-gradient(135deg, #3B1F6E 0%, #5A2D9C 100%)",
    emoji: "💻",
  },
  {
    title: "Fashion & Style",
    subtitle: "Trending clothing & accessories",
    cta: "Shop Fashion",
    link: "/products?category=fashion",
    bg: "linear-gradient(135deg, #2A1550 0%, #3B1F6E 100%)",
    emoji: "👗",
  },
  {
    title: "Home & Living",
    subtitle: "Beautiful furniture & decor",
    cta: "Shop Home",
    link: "/products?category=home-living",
    bg: "linear-gradient(135deg, #1A0A2E 0%, #2A1550 100%)",
    emoji: "🏠",
  },
];

function ProductCard({ product }) {
  const navigate = useNavigate();
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div
      onClick={() => navigate(`/products/${product.slug}`)}
      className="rounded-2xl overflow-hidden cursor-pointer transition hover:shadow-xl hover:-translate-y-1 group"
      style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", transition: "all 0.2s ease" }}
    >
      {/* Image */}
      <div className="relative h-52 flex items-center justify-center overflow-hidden"
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
        {product.is_featured && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>
            ⭐ Featured
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
      <div className="p-4">
        {product.brand && (
          <p className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: "#5A2D9C" }}>
            {product.brand}
          </p>
        )}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2" style={{ color: "#1A0A2E" }}>
          {product.name}
        </h3>

        {/* Rating */}
        {product.total_reviews > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className="text-xs"
                  style={{ color: star <= Math.round(product.rating) ? "#D4A017" : "#e2e8f0" }}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs" style={{ color: "#718096" }}>
              ({product.total_reviews})
            </span>
          </div>
        )}

        {/* Price */}
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
          <span className="text-xs" style={{ color: "#718096" }}>
            {product.sold} sold
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, catsRes, productsRes] = await Promise.all([
        API.get("/stats"),
        API.get("/categories"),
        API.get("/featured-products"),
      ]);
      setStats(statsRes.data);
      setCategories(catsRes.data);
      setFeaturedProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${search}`);
  };

  const CAT_ICONS = {
    "electronics": "💻",
    "fashion": "👗",
    "home-living": "🏠",
    "health-beauty": "💄",
    "sports-outdoors": "⚽",
    "books-education": "📚",
  };

  return (
    <div style={{ backgroundColor: "#F8F5FF" }}>
      <Navbar />

      {/* ── HERO SLIDESHOW ───────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: "480px" }}>
        {HERO_SLIDES.map((slide, i) => (
          <div key={i}
            className="absolute inset-0 flex items-center transition-all"
            style={{
              background: slide.bg,
              opacity: i === currentSlide ? 1 : 0,
              transition: "opacity 0.8s ease",
              zIndex: i === currentSlide ? 1 : 0,
            }}>
            <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
                  style={{ backgroundColor: "rgba(212,160,23,0.2)", color: "#D4A017", border: "1px solid rgba(212,160,23,0.3)" }}>
                  🛒 New Collection Available
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {slide.subtitle}
                </p>
                <div className="flex gap-4">
                  <Link to={slide.link}
                    className="px-8 py-4 rounded-2xl font-bold text-base transition hover:opacity-90"
                    style={{ backgroundColor: "#D4A017", color: "#1A0A2E", textDecoration: "none" }}>
                    {slide.cta} →
                  </Link>
                  <Link to="/products"
                    className="px-8 py-4 rounded-2xl font-bold text-base transition hover:opacity-80"
                    style={{ border: "2px solid rgba(255,255,255,0.4)", color: "#ffffff", textDecoration: "none" }}>
                    View All
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex text-9xl opacity-20 select-none">
                {slide.emoji}
              </div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 flex gap-2" style={{ transform: "translateX(-50%)", zIndex: 10 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)}
              className="rounded-full transition-all"
              style={{
                width: i === currentSlide ? "28px" : "8px",
                height: "8px",
                backgroundColor: i === currentSlide ? "#D4A017" : "rgba(255,255,255,0.4)",
                transition: "all 0.3s ease",
              }} />
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────── */}
      <section style={{ backgroundColor: "#1A0A2E" }} className="py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: stats.totalProducts + "+", label: "Products" },
            { value: stats.totalCategories + "+", label: "Categories" },
            { value: stats.totalCustomers + "+", label: "Customers" },
            { value: stats.totalOrders + "+", label: "Orders Delivered" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-bold" style={{ color: "#D4A017" }}>
                {loading ? "—" : s.value}
              </p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEARCH BAR ───────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <form onSubmit={handleSearch} className="flex gap-3 shadow-lg rounded-2xl overflow-hidden">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="What are you looking for today?"
            className="flex-1 px-6 py-4 text-base outline-none"
            style={{ backgroundColor: "#ffffff", color: "#1A0A2E" }}
          />
          <button type="submit"
            className="px-8 py-4 font-bold text-base transition hover:opacity-90"
            style={{ backgroundColor: "#3B1F6E", color: "#ffffff" }}>
            Search
          </button>
        </form>
      </section>

      {/* ── CATEGORIES ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>Shop by Category</h2>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>Find exactly what you need</p>
          </div>
          <Link to="/products"
            className="text-sm font-semibold transition hover:opacity-70"
            style={{ color: "#5A2D9C", textDecoration: "none" }}>
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`}
              className="flex flex-col items-center p-4 rounded-2xl transition hover:shadow-md hover:-translate-y-1"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", textDecoration: "none", transition: "all 0.2s ease" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 overflow-hidden"
                style={{ backgroundColor: "#F8F5FF" }}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (CAT_ICONS[cat.slug] || "📦")}
              </div>
              <p className="font-semibold text-xs text-center" style={{ color: "#1A0A2E" }}>{cat.name}</p>
              <p className="text-xs mt-0.5" style={{ color: "#A0AEC0" }}>
                {cat.total_products} items
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BANNER ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row"
          style={{ background: "linear-gradient(135deg, #3B1F6E 0%, #D4A017 100%)" }}>
          <div className="flex-1 p-10">
            <p className="text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
              Limited Time Offer
            </p>
            <h2 className="text-3xl font-bold text-white mb-3">
              Get 20% Off Your First Order
            </h2>
            <p className="mb-6" style={{ color: "rgba(255,255,255,0.8)" }}>
              Use code <strong style={{ color: "#D4A017" }}>WELCOME20</strong> at checkout
            </p>
            <Link to="/register"
              className="inline-block px-6 py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
              style={{ backgroundColor: "#ffffff", color: "#3B1F6E", textDecoration: "none" }}>
              Sign Up & Save →
            </Link>
          </div>
          <div className="hidden md:flex items-center justify-center px-10 text-8xl opacity-30 select-none">
            🎁
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>Featured Products</h2>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>Hand-picked items just for you</p>
          </div>
          <Link to="/products"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition hover:opacity-90"
            style={{ backgroundColor: "#3B1F6E", color: "#ffffff", textDecoration: "none" }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10" style={{ color: "#718096" }}>Loading products...</div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">📦</p>
            <p style={{ color: "#718096" }}>No products yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── WHY SHOPETHIO ────────────────────────── */}
      <section style={{ backgroundColor: "#ffffff" }} className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "#1A0A2E" }}>
            Why ShopEthio?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🚚", title: "Fast Delivery", desc: "Same-day delivery in Addis Ababa" },
              { icon: "🔒", title: "Secure Payment", desc: "Pay with Chapa, TeleBirr and more" },
              { icon: "↩️", title: "Easy Returns", desc: "30-day hassle-free returns" },
              { icon: "💬", title: "24/7 Support", desc: "Always here to help you" },
            ].map(item => (
              <div key={item.title} className="text-center p-6 rounded-2xl"
                style={{ backgroundColor: "#F8F5FF", border: "1px solid #e2e8f0" }}>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold mb-2" style={{ color: "#1A0A2E" }}>{item.title}</h3>
                <p className="text-sm" style={{ color: "#718096" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section className="py-20 text-center"
        style={{ background: "linear-gradient(135deg, #1A0A2E 0%, #3B1F6E 100%)" }}>
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Shopping Today
          </h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
            Join thousands of Ethiopians enjoying the best online shopping experience.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/products"
              className="px-8 py-4 rounded-2xl font-bold text-lg transition hover:opacity-90"
              style={{ backgroundColor: "#D4A017", color: "#1A0A2E", textDecoration: "none" }}>
              Browse Products
            </Link>
            <Link to="/register"
              className="px-8 py-4 rounded-2xl font-bold text-lg transition hover:opacity-80"
              style={{ border: "2px solid rgba(255,255,255,0.4)", color: "#ffffff", textDecoration: "none" }}>
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}