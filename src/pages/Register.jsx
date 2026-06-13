import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    border: "1px solid #e2e8f0", backgroundColor: "#F8F5FF", color: "#1A0A2E",
    width: "100%", padding: "12px 16px", borderRadius: "12px", fontSize: "14px", outline: "none",
  };

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-xl">

          {/* Left Panel */}
          <div className="hidden md:flex flex-col justify-center items-center w-1/2 px-12 py-16"
            style={{ background: "linear-gradient(135deg, #1A0A2E 0%, #3B1F6E 100%)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl mb-6"
              style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>SE</div>
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Join <span style={{ color: "#D4A017" }}>ShopEthio</span> Today
            </h2>
            <p className="text-center mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>
              Create your free account and start shopping.
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              {[
                "Free account forever",
                "Track your orders",
                "Save to wishlist",
                "Exclusive member deals",
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>✓</div>
                  <span className="text-sm text-white opacity-80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-10"
            style={{ backgroundColor: "#ffffff" }}>
            <div className="max-w-sm mx-auto w-full">
              <h1 className="text-2xl font-bold mb-1" style={{ color: "#1A0A2E" }}>Create Account</h1>
              <p className="text-sm mb-6" style={{ color: "#718096" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#5A2D9C", fontWeight: "600", textDecoration: "none" }}>
                  Sign in
                </Link>
              </p>

              {error && (
                <div className="text-sm px-4 py-3 rounded-xl mb-4"
                  style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Full Name *</label>
                  <input style={inputStyle} placeholder="John Doe" required
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                    onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Email Address *</label>
                  <input type="email" style={inputStyle} placeholder="you@example.com" required
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                    onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Phone Number</label>
                  <input style={inputStyle} placeholder="+251 9XX XXX XXX"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                    onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Password *</label>
                  <input type="password" style={inputStyle} placeholder="Min. 6 characters" required
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                    onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Confirm Password *</label>
                  <input type="password" style={inputStyle} placeholder="Repeat your password" required
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                    onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90 mt-2"
                  style={{ background: loading ? "#A0AEC0" : "linear-gradient(135deg, #D4A017, #B8860B)", color: "#1A0A2E" }}>
                  {loading ? "Creating account..." : "Create Free Account"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}