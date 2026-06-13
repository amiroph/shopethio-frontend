import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState({
    full_name: user?.name || "",
    phone: "",
    city: "Addis Ababa",
    sub_city: "",
    woreda: "",
    street: "",
  });
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await API.get("/customer/cart");
      if (res.data.length === 0) { navigate("/cart"); return; }
      setCartItems(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const subtotal = cartItems.reduce((sum, item) =>
    sum + (parseFloat(item.price) * item.quantity), 0
  );
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.full_name || !address.phone || !address.sub_city || !address.woreda) {
      setError("Please fill in all required address fields");
      return;
    }
    setError("");
    setPlacing(true);
    try {
      const res = await API.post("/orders", {
        shipping_address: address,
        notes,
      });
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order. Please try again.";
      setError(typeof msg === "string" ? msg : "Failed to place order. Please try again.");
      setPlacing(false);
    }
  };

  const inputStyle = {
    border: "1px solid #e2e8f0", backgroundColor: "#F8F5FF", color: "#1A0A2E",
    width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px", outline: "none",
  };

  if (loading) return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "#718096" }}>Loading checkout...</p>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "#1A0A2E" }}>Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left — Shipping + Payment */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Shipping Address */}
              <div className="rounded-2xl p-6"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                <h2 className="font-bold text-lg mb-5" style={{ color: "#1A0A2E" }}>
                  📍 Shipping Address
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                      Full Name *
                    </label>
                    <input style={inputStyle} required value={address.full_name}
                      onChange={e => setAddress({ ...address, full_name: e.target.value })}
                      onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                      onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                      Phone *
                    </label>
                    <input style={inputStyle} required placeholder="+251 9XX XXX XXX"
                      value={address.phone}
                      onChange={e => setAddress({ ...address, phone: e.target.value })}
                      onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                      onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                      City *
                    </label>
                    <input style={inputStyle} value={address.city}
                      onChange={e => setAddress({ ...address, city: e.target.value })}
                      onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                      onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                      Sub City *
                    </label>
                    <input style={inputStyle} required placeholder="e.g. Bole"
                      value={address.sub_city}
                      onChange={e => setAddress({ ...address, sub_city: e.target.value })}
                      onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                      onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                      Woreda *
                    </label>
                    <input style={inputStyle} required placeholder="e.g. 03"
                      value={address.woreda}
                      onChange={e => setAddress({ ...address, woreda: e.target.value })}
                      onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                      onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                      Street / Landmark
                    </label>
                    <input style={inputStyle} placeholder="e.g. Near Edna Mall"
                      value={address.street}
                      onChange={e => setAddress({ ...address, street: e.target.value })}
                      onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                      onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                      Order Notes <span className="font-normal" style={{ color: "#A0AEC0" }}>(optional)</span>
                    </label>
                    <textarea style={{ ...inputStyle, resize: "none" }} rows={3}
                      placeholder="Any special instructions for delivery..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                      onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl p-6"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                <h2 className="font-bold text-lg mb-5" style={{ color: "#1A0A2E" }}>
                  💳 Payment Method
                </h2>
                <div className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ backgroundColor: "#F8F5FF", border: "2px solid #5A2D9C" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: "#3B1F6E" }}>
                    💳
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "#1A0A2E" }}>Chapa Payment Gateway</p>
                    <p className="text-sm" style={{ color: "#718096" }}>
                      Pay securely with TeleBirr, CBE Birr, bank transfer and more
                    </p>
                  </div>
                  <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#5A2D9C" }}>
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                </div>
                <p className="text-xs mt-3" style={{ color: "#A0AEC0" }}>
                  🔒 You will be redirected to Chapa's secure payment page after placing your order.
                </p>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl p-6 sticky top-24"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                <h2 className="font-bold text-lg mb-5" style={{ color: "#1A0A2E" }}>Order Summary</h2>

                {/* Items */}
                <div className="flex flex-col gap-3 mb-5">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: "#F8F5FF" }}>
                        {item.primary_image ? (
                          <img src={item.primary_image} alt={item.name} className="w-full h-full object-cover" />
                        ) : <span className="text-xl opacity-30 flex items-center justify-center h-full">📦</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "#1A0A2E" }}>
                          {item.name}
                        </p>
                        <p className="text-xs" style={{ color: "#718096" }}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold flex-shrink-0" style={{ color: "#3B1F6E" }}>
                        ETB {(parseFloat(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="h-px mb-4" style={{ backgroundColor: "#e2e8f0" }} />

                {/* Totals */}
                <div className="flex flex-col gap-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#718096" }}>Subtotal</span>
                    <span className="font-semibold" style={{ color: "#1A0A2E" }}>
                      ETB {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#718096" }}>Shipping</span>
                    <span className="font-semibold"
                      style={{ color: shippingFee === 0 ? "#276749" : "#1A0A2E" }}>
                      {shippingFee === 0 ? "FREE" : `ETB ${shippingFee}`}
                    </span>
                  </div>
                  <div className="h-px" style={{ backgroundColor: "#e2e8f0" }} />
                  <div className="flex justify-between">
                    <span className="font-bold" style={{ color: "#1A0A2E" }}>Total</span>
                    <span className="font-bold text-xl" style={{ color: "#3B1F6E" }}>
                      ETB {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="text-sm px-4 py-3 rounded-xl mb-4"
                    style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={placing}
                  className="w-full py-4 rounded-xl font-bold text-base transition hover:opacity-90"
                  style={{
                    background: placing ? "#A0AEC0" : "linear-gradient(135deg, #D4A017, #B8860B)",
                    color: "#1A0A2E",
                  }}>
                  {placing ? "Processing..." : `Pay ETB ${total.toLocaleString()} →`}
                </button>

                <p className="text-xs text-center mt-3" style={{ color: "#A0AEC0" }}>
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}