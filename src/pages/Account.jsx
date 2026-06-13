import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Account() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, ordersRes] = await Promise.all([
        API.get("/auth/me"),
        API.get("/orders/my"),
      ]);
      setProfile(profileRes.data);
      setOrders(ordersRes.data.slice(0, 5));
      setForm({ name: profileRes.data.name || "", phone: profileRes.data.phone || "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await API.put("/customer/profile", form);
      updateUser({ name: form.name });
      setMsg("✅ Profile updated successfully!");
      setEditing(false);
      fetchData();
    } catch (err) {
      setMsg("❌ Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMsg("❌ Image must be under 5MB"); return; }
    setAvatarUploading(true);
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await API.put("/customer/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ avatar: res.data.avatar });
      setProfile(prev => ({ ...prev, avatar: res.data.avatar }));
      setMsg("✅ Profile picture updated!");
    } catch (err) {
      setMsg("❌ Failed to upload image.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwMsg("❌ Passwords do not match");
      return;
    }
    if (pwForm.new_password.length < 6) {
      setPwMsg("❌ Password must be at least 6 characters");
      return;
    }
    setPwLoading(true);
    setPwMsg("");
    try {
      await API.put("/customer/change-password", {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwMsg("✅ Password changed successfully!");
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPwMsg("❌ " + (err.response?.data?.message || "Failed to change password"));
    } finally {
      setPwLoading(false);
    }
  };

  const inputStyle = {
    border: "1px solid #e2e8f0", backgroundColor: "#F8F5FF", color: "#1A0A2E",
    width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px", outline: "none",
  };

  const STATUS_STYLES = {
    pending:    { bg: "#FFF8E1", color: "#B7791F" },
    processing: { bg: "#EBF8FF", color: "#2C5282" },
    shipped:    { bg: "#FAF5FF", color: "#553C9A" },
    delivered:  { bg: "#F0FFF4", color: "#276749" },
    cancelled:  { bg: "#FFF5F5", color: "#C53030" },
  };

  const TABS = [
    { key: "profile", label: "👤 Profile" },
    { key: "orders", label: "🧾 Orders" },
    { key: "security", label: "🔒 Security" },
  ];

  if (loading) return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p style={{ color: "#718096" }}>Loading account...</p>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Profile Header */}
        <div className="rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-6"
          style={{ background: "linear-gradient(135deg, #3B1F6E 0%, #5A2D9C 100%)" }}>

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-4xl text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
              {avatarUploading ? (
                <span className="text-2xl animate-pulse">⏳</span>
              ) : profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile?.name?.[0]?.toUpperCase()
              )}
            </div>
            <button onClick={() => fileInputRef.current.click()}
              disabled={avatarUploading}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg"
              style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>
              📷
            </button>
            <input ref={fileInputRef} type="file" accept="image/*"
              onChange={handleAvatarChange} className="hidden" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-white">{profile?.name}</h1>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>{profile?.email}</p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Member since {new Date(profile?.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="flex gap-4 text-center">
            {[
              { value: orders.length, label: "Orders" },
              { value: profile?.phone ? "✓" : "—", label: "Phone" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold" style={{ color: "#D4A017" }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              style={{
                background: activeTab === tab.key ? "linear-gradient(135deg, #3B1F6E, #5A2D9C)" : "#ffffff",
                color: activeTab === tab.key ? "#ffffff" : "#718096",
                border: "1px solid #e2e8f0",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="rounded-2xl p-8"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg" style={{ color: "#1A0A2E" }}>Personal Information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-90"
                  style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E", border: "1px solid #e2e8f0" }}>
                  ✏️ Edit
                </button>
              )}
            </div>

            {msg && (
              <div className="text-sm px-4 py-3 rounded-xl mb-4"
                style={{
                  backgroundColor: msg.includes("✅") ? "#F0FFF4" : "#FFF5F5",
                  color: msg.includes("✅") ? "#276749" : "#C53030",
                  border: `1px solid ${msg.includes("✅") ? "#9AE6B4" : "#FED7D7"}`,
                }}>
                {msg}
              </div>
            )}

            {editing ? (
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                    Full Name
                  </label>
                  <input style={inputStyle} value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                    onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                    Phone Number
                  </label>
                  <input style={inputStyle} value={form.phone}
                    placeholder="+251 9XX XXX XXX"
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                    onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold transition hover:opacity-90"
                    style={{ background: saving ? "#A0AEC0" : "linear-gradient(135deg, #3B1F6E, #5A2D9C)", color: "#ffffff" }}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditing(false)}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "#F8F5FF", color: "#718096", border: "1px solid #e2e8f0" }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  { label: "Full Name", value: profile?.name },
                  { label: "Email Address", value: profile?.email },
                  { label: "Phone Number", value: profile?.phone || "Not provided" },
                  { label: "Account Type", value: profile?.role === "admin" ? "Administrator" : "Customer" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ backgroundColor: "#F8F5FF" }}>
                    <p className="text-sm font-semibold w-36 flex-shrink-0" style={{ color: "#718096" }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold capitalize" style={{ color: "#1A0A2E" }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          <div className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "#e2e8f0" }}>
              <h2 className="font-bold text-lg" style={{ color: "#1A0A2E" }}>Recent Orders</h2>
              <Link to="/orders" className="text-sm font-semibold"
                style={{ color: "#5A2D9C", textDecoration: "none" }}>
                View all →
              </Link>
            </div>
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">🧾</p>
                <p className="font-semibold" style={{ color: "#1A0A2E" }}>No orders yet</p>
                <Link to="/products"
                  className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)", textDecoration: "none" }}>
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
                {orders.map(order => {
                  const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                  return (
                    <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#1A0A2E" }}>
                          #{order.order_number}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#718096" }}>
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-sm" style={{ color: "#3B1F6E" }}>
                          ETB {parseFloat(order.total).toLocaleString()}
                        </p>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                          style={{ backgroundColor: s.bg, color: s.color }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === "security" && (
          <div className="rounded-2xl p-8"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <h2 className="font-bold text-lg mb-6" style={{ color: "#1A0A2E" }}>Change Password</h2>

            {pwMsg && (
              <div className="text-sm px-4 py-3 rounded-xl mb-5"
                style={{
                  backgroundColor: pwMsg.includes("✅") ? "#F0FFF4" : "#FFF5F5",
                  color: pwMsg.includes("✅") ? "#276749" : "#C53030",
                  border: `1px solid ${pwMsg.includes("✅") ? "#9AE6B4" : "#FED7D7"}`,
                }}>
                {pwMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                  Current Password *
                </label>
                <input type="password" style={inputStyle} required
                  value={pwForm.current_password}
                  onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
                  onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                  New Password *
                </label>
                <input type="password" style={inputStyle} required
                  placeholder="Min. 6 characters"
                  value={pwForm.new_password}
                  onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                  onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
                  Confirm New Password *
                </label>
                <input type="password" style={inputStyle} required
                  placeholder="Repeat new password"
                  value={pwForm.confirm_password}
                  onChange={e => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                  onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                  onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
              </div>
              <button type="submit" disabled={pwLoading}
                className="px-6 py-3 rounded-xl text-sm font-bold transition hover:opacity-90 w-fit"
                style={{ background: pwLoading ? "#A0AEC0" : "linear-gradient(135deg, #3B1F6E, #5A2D9C)", color: "#ffffff" }}>
                {pwLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}