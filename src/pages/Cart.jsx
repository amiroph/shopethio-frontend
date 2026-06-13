import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await API.get("/customer/cart");
      setCartItems(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    setUpdating(itemId);
    try {
      await API.put(`/customer/cart/${itemId}`, { quantity: newQty });
      setCartItems(prev =>
        prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await API.delete(`/customer/cart/${itemId}`);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) { console.error(err); }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    try {
      await API.delete("/customer/cart");
      setCartItems([]);
    } catch (err) { console.error(err); }
  };

  const subtotal = cartItems.reduce((sum, item) =>
    sum + (parseFloat(item.price) * item.quantity), 0
  );
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>Shopping Cart</h1>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          {cartItems.length > 0 && (
            <button onClick={handleClearCart}
              className="text-sm font-semibold transition hover:opacity-70"
              style={{ color: "#C53030" }}>
              Clear Cart
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: "#718096" }}>Loading cart...</div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-2xl p-16 text-center"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-xl font-bold mb-2" style={{ color: "#1A0A2E" }}>Your cart is empty</p>
            <p className="text-sm mb-6" style={{ color: "#718096" }}>
              Looks like you haven't added anything yet
            </p>
            <Link to="/products"
              className="inline-block px-6 py-3 rounded-xl font-bold text-sm text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)", textDecoration: "none" }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Items */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cartItems.map(item => (
                <div key={item.id} className="rounded-2xl p-5 flex gap-4"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>

                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#F8F5FF" }}>
                    {item.primary_image ? (
                      <img src={item.primary_image} alt={item.name} className="w-full h-full object-cover" />
                    ) : <span className="text-3xl opacity-30">📦</span>}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <Link to={`/products/${item.slug}`}
                      className="font-semibold text-sm hover:underline"
                      style={{ color: "#1A0A2E", textDecoration: "none" }}>
                      {item.name}
                    </Link>
                    <p className="text-lg font-bold mt-1" style={{ color: "#3B1F6E" }}>
                      ETB {parseFloat(item.price).toLocaleString()}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center rounded-xl overflow-hidden"
                        style={{ border: "1px solid #e2e8f0" }}>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating === item.id}
                          className="w-9 h-9 flex items-center justify-center font-bold transition hover:opacity-80"
                          style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E" }}>−</button>
                        <span className="w-10 text-center text-sm font-bold" style={{ color: "#1A0A2E" }}>
                          {updating === item.id ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock || updating === item.id}
                          className="w-9 h-9 flex items-center justify-center font-bold transition hover:opacity-80"
                          style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E" }}>+</button>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold" style={{ color: "#3B1F6E" }}>
                          ETB {(parseFloat(item.price) * item.quantity).toLocaleString()}
                        </p>
                        <button onClick={() => handleRemove(item.id)}
                          className="text-sm transition hover:opacity-70"
                          style={{ color: "#C53030" }}>
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link to="/products"
                className="text-sm font-semibold transition hover:opacity-70"
                style={{ color: "#5A2D9C", textDecoration: "none" }}>
                ← Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl p-6 sticky top-24"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                <h2 className="font-bold text-lg mb-5" style={{ color: "#1A0A2E" }}>Order Summary</h2>

                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#718096" }}>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold" style={{ color: "#1A0A2E" }}>
                      ETB {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#718096" }}>Shipping Fee</span>
                    <span className="font-semibold"
                      style={{ color: shippingFee === 0 ? "#276749" : "#1A0A2E" }}>
                      {shippingFee === 0 ? "FREE" : `ETB ${shippingFee}`}
                    </span>
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-xs px-3 py-2 rounded-xl"
                      style={{ backgroundColor: "#FFF8E1", color: "#B7791F" }}>
                      💡 Add ETB {(500 - subtotal).toLocaleString()} more for free delivery!
                    </p>
                  )}
                  <div className="h-px" style={{ backgroundColor: "#e2e8f0" }} />
                  <div className="flex justify-between">
                    <span className="font-bold" style={{ color: "#1A0A2E" }}>Total</span>
                    <span className="font-bold text-xl" style={{ color: "#3B1F6E" }}>
                      ETB {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-4 rounded-xl font-bold text-base transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #D4A017, #B8860B)", color: "#1A0A2E" }}>
                  Proceed to Checkout →
                </button>

                {/* Payment icons */}
                <div className="mt-4 text-center">
                  <p className="text-xs mb-2" style={{ color: "#A0AEC0" }}>Secured by</p>
                  <div className="flex justify-center gap-2">
                    {["Chapa", "TeleBirr", "CBE"].map(p => (
                      <span key={p} className="text-xs px-2 py-1 rounded-lg font-semibold"
                        style={{ backgroundColor: "#F8F5FF", color: "#5A2D9C", border: "1px solid #e2e8f0" }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}