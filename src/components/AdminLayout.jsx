import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
  { label: "Products", path: "/admin/products", icon: "📦" },
  { label: "Categories", path: "/admin/categories", icon: "🏷️" },
  { label: "Orders", path: "/admin/orders", icon: "🧾" },
  { label: "Customers", path: "/admin/customers", icon: "👥" },
  { label: "Reports", path: "/admin/reports", icon: "📈" },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8F5FF" }}>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-50"
        style={{ background: "linear-gradient(180deg, #1A0A2E 0%, #3B1F6E 100%)" }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>SE</div>
            <span className="font-bold text-white">
              Shop<span style={{ color: "#D4A017" }}>Ethio</span>
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-1"
              style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>Admin</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left transition"
                style={{
                  backgroundColor: isActive ? "rgba(212,160,23,0.2)" : "transparent",
                  color: isActive ? "#D4A017" : "rgba(255,255,255,0.65)",
                  borderLeft: isActive ? "3px solid #D4A017" : "3px solid transparent",
                }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* View Site */}
        <div className="px-3 py-2">
          <button onClick={() => navigate("/")}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium w-full text-left transition hover:opacity-80"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
            🌐 View Store
          </button>
        </div>

        {/* User */}
        <div className="px-3 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs flex-shrink-0"
              style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-xs opacity-50 text-white">Admin</p>
            </div>
            <button onClick={handleLogout}
              className="text-xs opacity-50 hover:opacity-100 text-white transition">⎋</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-8">{children}</main>
    </div>
  );
}