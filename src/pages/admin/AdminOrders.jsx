import { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import Pagination from "../../components/Pagination";

const STATUS_STYLES = {
  pending:    { bg: "#FFF8E1", color: "#B7791F" },
  processing: { bg: "#EBF8FF", color: "#2C5282" },
  shipped:    { bg: "#FAF5FF", color: "#553C9A" },
  delivered:  { bg: "#F0FFF4", color: "#276749" },
  cancelled:  { bg: "#FFF5F5", color: "#C53030" },
};

const PAYMENT_STYLES = {
  unpaid:   { bg: "#FFF5F5", color: "#C53030" },
  paid:     { bg: "#F0FFF4", color: "#276749" },
  refunded: { bg: "#FFF8E1", color: "#B7791F" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders(1);
  }, [filterStatus, filterPayment]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (filterStatus) params.status = filterStatus;
      if (filterPayment) params.payment_status = filterPayment;
      const res = await API.get("/admin/orders", { params });
      setOrders(res.data.data);
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
    fetchOrders(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (selected?.id === orderId) setSelected(prev => ({ ...prev, status }));
    } catch (err) { alert("Failed to update"); }
    finally { setUpdating(null); }
  };

  const filtered = orders.filter(o =>
    !search ||
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(search.toLowerCase())
  );

  const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>Orders</h1>
        <p className="text-sm mt-1" style={{ color: "#718096" }}>{pagination.total} total orders</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { key: "", label: "All", color: "#3B1F6E", bg: "#F8F5FF" },
          { key: "pending", label: "Pending", color: "#B7791F", bg: "#FFF8E1" },
          { key: "processing", label: "Processing", color: "#2C5282", bg: "#EBF8FF" },
          { key: "shipped", label: "Shipped", color: "#553C9A", bg: "#FAF5FF" },
          { key: "delivered", label: "Delivered", color: "#276749", bg: "#F0FFF4" },
          { key: "cancelled", label: "Cancelled", color: "#C53030", bg: "#FFF5F5" },
        ].map(s => (
          <button key={s.key} onClick={() => { setFilterStatus(s.key); }}
            className="rounded-2xl p-3 text-center transition hover:shadow-md"
            style={{
              backgroundColor: filterStatus === s.key ? s.color : "#ffffff",
              border: `1px solid ${filterStatus === s.key ? s.color : "#e2e8f0"}`,
            }}>
            <p className="text-sm font-bold"
              style={{ color: filterStatus === s.key ? "#ffffff" : s.color }}>
              {s.label}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 flex-wrap mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by order number or customer..."
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#1A0A2E" }}
          onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
          onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
        <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#1A0A2E" }}>
          <option value="">All Payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="text-center py-10" style={{ color: "#718096" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl p-12 text-center"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <p className="text-4xl mb-3">🧾</p>
              <p style={{ color: "#718096" }}>No orders found</p>
            </div>
          ) : filtered.map(order => {
            const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            const p = PAYMENT_STYLES[order.payment_status] || PAYMENT_STYLES.unpaid;
            return (
              <div key={order.id} onClick={() => setSelected(order)}
                className="rounded-2xl p-5 cursor-pointer transition hover:shadow-md"
                style={{
                  backgroundColor: selected?.id === order.id ? "#F8F5FF" : "#ffffff",
                  border: `1px solid ${selected?.id === order.id ? "#5A2D9C" : "#e2e8f0"}`,
                }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#1A0A2E" }}>
                      #{order.order_number}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#718096" }}>
                      {order.customer_name} · {order.item_count} item{order.item_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: "#3B1F6E" }}>
                      ETB {parseFloat(order.total).toLocaleString()}
                    </p>
                    <p className="text-xs" style={{ color: "#A0AEC0" }}>
                      {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                    style={{ backgroundColor: s.bg, color: s.color }}>{order.status}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize"
                    style={{ backgroundColor: p.bg, color: p.color }}>{order.payment_status}</span>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={10}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Order Detail */}
        <div className="rounded-2xl sticky top-8"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", height: "fit-content" }}>
          {!selected ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">🧾</p>
              <p className="font-semibold" style={{ color: "#1A0A2E" }}>Select an order</p>
              <p className="text-sm mt-1" style={{ color: "#718096" }}>Click any order to see details</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "#1A0A2E" }}>
                    #{selected.order_number}
                  </h3>
                  <p className="text-sm" style={{ color: "#718096" }}>
                    {selected.customer_name} · {selected.customer_email}
                  </p>
                </div>
                <p className="font-bold text-lg" style={{ color: "#3B1F6E" }}>
                  ETB {parseFloat(selected.total).toLocaleString()}
                </p>
              </div>

              {/* Update Status */}
              <div className="mb-5">
                <p className="text-sm font-semibold mb-2" style={{ color: "#1A0A2E" }}>Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ORDER_STATUSES.map(s => {
                    const style = STATUS_STYLES[s];
                    return (
                      <button key={s} onClick={() => handleStatusUpdate(selected.id, s)}
                        disabled={updating === selected.id || selected.status === s}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize"
                        style={{
                          backgroundColor: selected.status === s ? style.color : style.bg,
                          color: selected.status === s ? "#ffffff" : style.color,
                          opacity: updating === selected.id ? 0.6 : 1,
                        }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              {selected.shipping_address && (
                <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: "#F8F5FF" }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#718096" }}>
                    Shipping Address
                  </p>
                  {(() => {
                    const addr = typeof selected.shipping_address === "string"
                      ? JSON.parse(selected.shipping_address)
                      : selected.shipping_address;
                    return (
                      <div className="text-sm" style={{ color: "#1A0A2E" }}>
                        <p className="font-semibold">{addr.full_name}</p>
                        <p>{addr.phone}</p>
                        <p>{[addr.street, addr.woreda && `Woreda ${addr.woreda}`,
                          addr.sub_city, addr.city].filter(Boolean).join(", ")}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Payment Summary */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: "#718096" }}>Payment Summary</p>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "#718096" }}>Subtotal</span>
                    <span className="font-semibold" style={{ color: "#1A0A2E" }}>
                      ETB {parseFloat(selected.subtotal).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#718096" }}>Shipping</span>
                    <span className="font-semibold" style={{ color: "#1A0A2E" }}>
                      {parseFloat(selected.shipping_fee) === 0
                        ? "FREE"
                        : `ETB ${parseFloat(selected.shipping_fee).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="h-px" style={{ backgroundColor: "#e2e8f0" }} />
                  <div className="flex justify-between font-bold">
                    <span style={{ color: "#1A0A2E" }}>Total</span>
                    <span style={{ color: "#3B1F6E" }}>
                      ETB {parseFloat(selected.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}