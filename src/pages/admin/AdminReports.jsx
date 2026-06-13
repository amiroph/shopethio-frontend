import { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/reports");
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", data.totalRevenue],
      ["Total Orders", data.totalOrders],
      ["Paid Orders", data.paidOrders],
      [],
      ["Top Products", "Units Sold"],
      ...data.topProducts.map(p => [p.name, p.sold]),
      [],
      ["Order Status", "Count"],
      ...data.salesByStatus.map(s => [s.status, s.count]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopethio-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const STATUS_COLORS = {
    pending:    "#B7791F",
    processing: "#2C5282",
    shipped:    "#553C9A",
    delivered:  "#276749",
    cancelled:  "#C53030",
  };

  const maxSold = data?.topProducts?.length > 0
    ? Math.max(...data.topProducts.map(p => p.sold))
    : 1;

  const maxRevenue = data?.recentRevenue?.length > 0
    ? Math.max(...data.recentRevenue.map(r => parseFloat(r.revenue)))
    : 1;

  if (loading) return (
    <AdminLayout>
      <div className="text-center py-20" style={{ color: "#718096" }}>Loading reports...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>Reports</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            ShopEthio analytics and performance
          </p>
        </div>
        <button onClick={exportCSV}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)", color: "#ffffff" }}>
          ⬇ Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Total Revenue", value: `ETB ${parseFloat(data.totalRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: "💰", color: "#D4A017", bg: "#FFF8E1" },
          { label: "Total Orders", value: data.totalOrders, icon: "🧾", color: "#3B1F6E", bg: "#F8F5FF" },
          { label: "Paid Orders", value: data.paidOrders, icon: "✅", color: "#276749", bg: "#F0FFF4" },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-6"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
              style={{ backgroundColor: card.bg }}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Revenue Last 7 Days */}
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <h3 className="font-bold mb-5" style={{ color: "#1A0A2E" }}>
            📈 Revenue Last 7 Days
          </h3>
          {data.recentRevenue?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📊</p>
              <p style={{ color: "#718096" }}>No revenue data yet</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {data.recentRevenue?.map((day, i) => {
                const height = (parseFloat(day.revenue) / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-xs font-semibold" style={{ color: "#3B1F6E" }}>
                      {parseFloat(day.revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${Math.max(8, height)}%`,
                        background: "linear-gradient(180deg, #5A2D9C, #3B1F6E)",
                        minHeight: "8px",
                      }} />
                    <p className="text-xs" style={{ color: "#A0AEC0" }}>
                      {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
          <h3 className="font-bold mb-5" style={{ color: "#1A0A2E" }}>📋 Orders by Status</h3>
          {data.salesByStatus?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🧾</p>
              <p style={{ color: "#718096" }}>No orders yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {data.salesByStatus?.map(s => {
                const total = data.salesByStatus.reduce((sum, x) => sum + parseInt(x.count), 0);
                const pct = total > 0 ? (parseInt(s.count) / total) * 100 : 0;
                const color = STATUS_COLORS[s.status] || "#718096";
                return (
                  <div key={s.status} className="flex items-center gap-3">
                    <p className="text-sm font-semibold w-24 capitalize flex-shrink-0"
                      style={{ color: "#4A5568" }}>{s.status}</p>
                    <div className="flex-1 h-4 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#F8F5FF" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-sm font-bold w-8 text-right flex-shrink-0"
                      style={{ color }}>
                      {s.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="rounded-2xl p-6"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <h3 className="font-bold mb-5" style={{ color: "#1A0A2E" }}>🏆 Top Selling Products</h3>
        {data.topProducts?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📦</p>
            <p style={{ color: "#718096" }}>No sales data yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.topProducts?.map((product, i) => {
              const pct = maxSold > 0 ? (product.sold / maxSold) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: "#F8F5FF" }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : <span className="text-xl flex items-center justify-center h-full opacity-30">📦</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#1A0A2E" }}>
                        {product.name}
                      </p>
                      <p className="text-sm font-bold" style={{ color: "#3B1F6E" }}>
                        {product.sold} sold
                      </p>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#F8F5FF" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #3B1F6E, #D4A017)",
                        }} />
                    </div>
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