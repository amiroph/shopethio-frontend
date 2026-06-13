import { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import Pagination from "../../components/Pagination";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers(1);
  }, [search]);

  const fetchCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/admin/customers", { params: { page, search } });
      setCustomers(res.data.data);
      setPagination({
        page: res.data.page,
        totalPages: res.data.totalPages,
        total: res.data.total,
      });
      setCurrentPage(res.data.page);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCustomers(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (id) => {
    try {
      await API.put(`/admin/customers/${id}/toggle`);
      setCustomers(prev => prev.map(c =>
        c.id === id ? { ...c, is_active: !c.is_active } : c
      ));
    } catch (err) { alert("Failed to update"); }
  };

  const totalRevenue = customers.reduce(
    (sum, c) => sum + parseFloat(c.total_spent || 0), 0
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>Customers</h1>
        <p className="text-sm mt-1" style={{ color: "#718096" }}>
          {pagination.total} registered customers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Customers", value: pagination.total, color: "#3B1F6E", bg: "#F8F5FF" },
          { label: "Active", value: customers.filter(c => c.is_active).length, color: "#276749", bg: "#F0FFF4" },
          { label: "Total Revenue", value: `ETB ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "#D4A017", bg: "#FFF8E1" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: "#718096" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search customers by name or email..."
          className="w-full max-w-sm px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#1A0A2E" }}
          onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
          onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#F8F5FF", borderBottom: "1px solid #e2e8f0" }}>
              {["Customer", "Phone", "Orders", "Total Spent", "Joined", "Status"].map(h => (
                <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#718096" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="px-5 py-12 text-center" style={{ color: "#718096" }}>
                Loading...
              </td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan="6" className="px-5 py-12 text-center">
                <p className="text-3xl mb-2">👥</p>
                <p style={{ color: "#718096" }}>No customers found</p>
              </td></tr>
            ) : customers.map((c, i) => (
              <tr key={c.id}
                style={{ borderBottom: i < customers.length - 1 ? "1px solid #e2e8f0" : "none" }}
                className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: c.is_active ? "#5A2D9C" : "#A0AEC0", color: "#ffffff" }}>
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                      ) : c.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#1A0A2E" }}>{c.name}</p>
                      <p className="text-xs" style={{ color: "#718096" }}>{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>{c.phone || "—"}</td>
                <td className="px-5 py-4">
                  <span className="font-bold text-sm" style={{ color: "#3B1F6E" }}>{c.total_orders}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="font-semibold text-sm" style={{ color: "#D4A017" }}>
                    ETB {parseFloat(c.total_spent || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>
                  {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleToggle(c.id)}>
                    <div className="w-9 h-5 rounded-full relative"
                      style={{ backgroundColor: c.is_active ? "#5A2D9C" : "#CBD5E0" }}>
                      <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all"
                        style={{ left: c.is_active ? "20px" : "2px" }} />
                    </div>
                    <span className="text-xs font-semibold"
                      style={{ color: c.is_active ? "#276749" : "#C53030" }}>
                      {c.is_active ? "Active" : "Blocked"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={10}
        onPageChange={handlePageChange}
      />
    </AdminLayout>
  );
}