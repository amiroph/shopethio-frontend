import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-xl">

          {/* Left Panel */}
          <div className="hidden md:flex flex-col justify-center items-center w-1/2 px-12 py-16"
            style={{ background: "linear-gradient(135deg, #3B1F6E 0%, #5A2D9C 100%)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl mb-6"
              style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>SE</div>
            <h2 className="text-3xl font-bold text-white text-center mb-4">
              Welcome Back to <span style={{ color: "#D4A017" }}>ShopEthio</span>
            </h2>
            <p className="text-center mb-10" style={{ color: "rgba(255,255,255,0.7)" }}>
              Your premium Ethiopian shopping destination.
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              {["Thousands of products", "Fast delivery in Ethiopia", "Secure Chapa payment", "Easy returns"].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>✓</div>
                  <span className="text-sm text-white opacity-80">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-16"
            style={{ backgroundColor: "#ffffff" }}>
            <div className="max-w-sm mx-auto w-full">
              <h1 className="text-2xl font-bold mb-1" style={{ color: "#1A0A2E" }}>Sign In</h1>
              <p className="text-sm mb-8" style={{ color: "#718096" }}>
                Don't have an account?{" "}
                <Link to="/register" style={{ color: "#5A2D9C", fontWeight: "600", textDecoration: "none" }}>
                  Register here
                </Link>
              </p>

              {error && (
                <div className="text-sm px-4 py-3 rounded-xl mb-5"
                  style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                    Email Address
                  </label>
                  <input type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com" required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ border: "1px solid #e2e8f0", backgroundColor: "#F8F5FF", color: "#1A0A2E" }}
                    onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                    onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                    Password
                  </label>
                  <input type="password" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password" required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ border: "1px solid #e2e8f0", backgroundColor: "#F8F5FF", color: "#1A0A2E" }}
                    onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                    onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
                  style={{ background: loading ? "#A0AEC0" : "linear-gradient(135deg, #3B1F6E, #5A2D9C)", color: "#ffffff" }}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <div className="mt-6 p-4 rounded-xl text-xs" style={{ backgroundColor: "#F8F5FF" }}>
                <p className="font-semibold mb-1" style={{ color: "#1A0A2E" }}>Test Account:</p>
                <p style={{ color: "#718096" }}>admin@shopethio.com / password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}