import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) fetchCartCount();
    else setCartCount(0);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await API.get("/customer/cart");
      setCartCount(res.data.length);
    } catch (err) {
      setCartCount(0);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${search}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: "#3B1F6E" }}>

      {/* Top Bar */}
      <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#2A1550" }}>
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            🇪🇹 Free delivery on orders over ETB 500
          </p>
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <Link to="/login" className="text-xs transition hover:opacity-80"
                  style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                  Sign In
                </Link>
                <Link to="/register" className="text-xs transition hover:opacity-80"
                  style={{ color: "#D4A017", textDecoration: "none" }}>
                  Register
                </Link>
              </>
            ) : (
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                Hello, {user.name?.split(" ")[0]}!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0" style={{ textDecoration: "none" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>
            SE
          </div>
          <span className="text-xl font-bold text-white">
            Shop<span style={{ color: "#D4A017" }}>Ethio</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for products, brands and more..."
            className="flex-1 px-5 py-2.5 rounded-l-xl text-sm outline-none"
            style={{ backgroundColor: "#ffffff", color: "#1A0A2E" }}
          />
          <button type="submit"
            className="px-5 py-2.5 rounded-r-xl font-bold text-sm transition hover:opacity-90"
            style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>
            🔍
          </button>
        </form>

        {/* Right Icons */}
        <div className="flex items-center gap-4 flex-shrink-0">

          {/* Cart */}
          <Link to="/cart" className="relative flex flex-col items-center transition hover:opacity-80"
            style={{ textDecoration: "none" }}>
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}
              >
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
            <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Cart</span>
          </Link>

          {/* Wishlist */}
          {user && (
            <Link to="/wishlist" className="flex flex-col items-center transition hover:opacity-80"
              style={{ textDecoration: "none" }}>
              <span className="text-2xl">❤️</span>
              <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Wishlist</span>
            </Link>
          )}

          {/* User Dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex flex-col items-center transition hover:opacity-80"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Account</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl overflow-hidden z-50"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                  <div className="px-4 py-3 border-b flex items-center gap-3"
                    style={{ borderColor: "#e2e8f0" }}>
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#1A0A2E" }}>{user.name}</p>
                      <p className="text-xs capitalize" style={{ color: "#718096" }}>{user.role}</p>
                    </div>
                  </div>

                  {user.role === "admin" ? (
                    <>
                      <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-gray-50"
                        style={{ color: "#1A0A2E", textDecoration: "none" }}>
                        📊 Admin Dashboard
                      </Link>
                      <Link to="/admin/products" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-gray-50"
                        style={{ color: "#1A0A2E", textDecoration: "none" }}>
                        📦 Products
                      </Link>
                      <Link to="/admin/orders" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-gray-50"
                        style={{ color: "#1A0A2E", textDecoration: "none" }}>
                        🧾 Orders
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/account" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-gray-50"
                        style={{ color: "#1A0A2E", textDecoration: "none" }}>
                        👤 My Account
                      </Link>
                      <Link to="/orders" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-gray-50"
                        style={{ color: "#1A0A2E", textDecoration: "none" }}>
                        🧾 My Orders
                      </Link>
                      <Link to="/wishlist" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-gray-50"
                        style={{ color: "#1A0A2E", textDecoration: "none" }}>
                        ❤️ Wishlist
                      </Link>
                    </>
                  )}

                  <div className="border-t" style={{ borderColor: "#e2e8f0" }}>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 text-sm w-full text-left transition hover:bg-gray-50"
                      style={{ color: "#C53030" }}>
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login"
              className="flex flex-col items-center transition hover:opacity-80"
              style={{ textDecoration: "none" }}>
              <span className="text-2xl">👤</span>
              <span className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>Account</span>
            </Link>
          )}
        </div>
      </div>

      {/* Category Nav */}
      <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "#2A1550" }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 overflow-x-auto py-2.5">
          <Link to="/products"
            className="text-sm font-semibold whitespace-nowrap transition hover:opacity-80"
            style={{ color: isActive("/products") ? "#D4A017" : "rgba(255,255,255,0.8)", textDecoration: "none" }}>
            All Products
          </Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`}
              className="text-sm whitespace-nowrap transition hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
              {cat.name}
            </Link>
          ))}
          <Link to="/products?sort=popular"
            className="text-sm font-semibold whitespace-nowrap transition hover:opacity-80"
            style={{ color: "#D4A017", textDecoration: "none" }}>
            🔥 Best Sellers
          </Link>
          <Link to="/products?featured=true"
            className="text-sm font-semibold whitespace-nowrap transition hover:opacity-80"
            style={{ color: "#D4A017", textDecoration: "none" }}>
            ⭐ Featured
          </Link>
        </div>
      </div>
    </header>
  );
}