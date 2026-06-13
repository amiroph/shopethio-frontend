import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/orders"),
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 6));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const STATUS_STYLES = {
    pending:    { bg: "#FFF8E1", color: "#B7791F" },
    processing: { bg: "#EBF8FF", color: "#2C5282" },
    shipped:    { bg: "#FAF5FF", color: "#553C9A" },
    delivered:  { bg: "#F0FFF4", color: "#276749" },
    cancelled:  { bg: "#FFF5F5", color: "#C53030" },
  };

  const STAT_CARDS = [
    { label: "Total Revenue", value: `ETB ${parseFloat(stats.totalRevenue || 0).toLocaleString()}`, icon: "💰", color: "#D4A017", bg: "#FFF8E1", path: "/admin/orders" },
    { label: "Total Orders", value: stats.totalOrders, icon: "🧾", color: "#3B1F6E", bg: "#F8F5FF", path: "/admin/orders" },
    { label: "Total Products", value: stats.totalProducts, icon: "📦", color: "#5A2D9C", bg: "#FAF5FF", path: "/admin/products" },
    { label: "Total Customers", value: stats.totalCustomers, icon: "👥", color: "#2C5282", bg: "#EBF8FF", path: "/admin/customers" },
    { label: "Pending Orders", value: stats.pendingOrders, icon: "⏳", color: "#B7791F", bg: "#FFF8E1", path: "/admin/orders" },
    { label: "Low Stock", value: stats.lowStock, icon: "⚠️", color: "#C53030", bg: "#FFF5F5", path: "/admin/products" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#718096" }}>
          Welcome back! Here's your ShopEthio overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
        {STAT_CARDS.map(card => (
          <div key={card.label} onClick={() => navigate(card.path)}
            className="rounded-2xl p-5 cursor-pointer transition hover:shadow-md"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ backgroundColor: card.bg }}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {loading ? "—" : card.value ?? 0}
            </p>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Add Product", icon: "📦", path: "/admin/products", color: "#3B1F6E" },
          { label: "Add Category", icon: "🏷️", path: "/admin/categories", color: "#5A2D9C" },
          { label: "View Orders", icon: "🧾", path: "/admin/orders", color: "#D4A017" },
        ].map(action => (
          <button key={action.label} onClick={() => navigate(action.path)}
            className="flex items-center gap-4 p-5 rounded-2xl text-left transition hover:shadow-md"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: action.color + "15" }}>
              {action.icon}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "#1A0A2E" }}>{action.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "#718096" }}>Click to manage →</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#e2e8f0" }}>
          <h2 className="font-bold" style={{ color: "#1A0A2E" }}>Recent Orders</h2>
          <button onClick={() => navigate("/admin/orders")}
            className="text-sm font-semibold" style={{ color: "#5A2D9C" }}>
            View all →
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center" style={{ color: "#718096" }}>Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">🧾</p>
            <p className="font-semibold" style={{ color: "#1A0A2E" }}>No orders yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#e2e8f0" }}>
            {recentOrders.map(order => {
              const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
              return (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1A0A2E" }}>
                      #{order.order_number}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#718096" }}>
                      {order.customer_name} · {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
    </AdminLayout>
  );
}