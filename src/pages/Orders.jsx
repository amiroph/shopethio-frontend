import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLES = {
  pending:    { bg: "#FFF8E1", color: "#B7791F", label: "Pending", icon: "⏳" },
  processing: { bg: "#EBF8FF", color: "#2C5282", label: "Processing", icon: "⚙️" },
  shipped:    { bg: "#FAF5FF", color: "#553C9A", label: "Shipped", icon: "🚚" },
  delivered:  { bg: "#F0FFF4", color: "#276749", label: "Delivered", icon: "✅" },
  cancelled:  { bg: "#FFF5F5", color: "#C53030", label: "Cancelled", icon: "❌" },
};

const PAYMENT_STYLES = {
  unpaid:   { bg: "#FFF5F5", color: "#C53030", label: "Unpaid" },
  paid:     { bg: "#F0FFF4", color: "#276749", label: "Paid" },
  refunded: { bg: "#FFF8E1", color: "#B7791F", label: "Refunded" },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchOrders(1);
  }, [user]);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/orders/my", { params: { page } });
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

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(orderId);
    try {
      await API.put(`/orders/${orderId}/cancel`);
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>My Orders</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            {pagination.total} order{pagination.total !== 1 ? "s" : ""} placed
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: "#718096" }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl p-16 text-center"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <p className="text-6xl mb-4">🧾</p>
            <p className="text-xl font-bold mb-2" style={{ color: "#1A0A2E" }}>No orders yet</p>
            <p className="text-sm mb-6" style={{ color: "#718096" }}>
              Start shopping to see your orders here
            </p>
            <Link to="/products"
              className="inline-block px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)", textDecoration: "none" }}>
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {orders.map(order => {
                const s = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                const p = PAYMENT_STYLES[order.payment_status] || PAYMENT_STYLES.unpaid;
                const isExpanded = expanded === order.id;
                const address = order.shipping_address
                  ? (typeof order.shipping_address === "string"
                    ? JSON.parse(order.shipping_address)
                    : order.shipping_address)
                  : null;

                return (
                  <div key={order.id} className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>

                    {/* Order Header */}
                    <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold" style={{ color: "#1A0A2E" }}>#{order.order_number}</p>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: s.bg, color: s.color }}>
                            {s.icon} {s.label}
                          </span>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: p.bg, color: p.color }}>
                            {p.label}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: "#718096" }}>
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "long", day: "numeric", year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-lg" style={{ color: "#3B1F6E" }}>
                          ETB {parseFloat(order.total).toLocaleString()}
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                            className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
                            style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E", border: "1px solid #e2e8f0" }}>
                            {isExpanded ? "Hide" : "Details"}
                          </button>
                          {order.status === "pending" && (
                            <button onClick={() => handleCancel(order.id)}
                              disabled={cancelling === order.id}
                              className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:opacity-80"
                              style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
                              {cancelling === order.id ? "..." : "Cancel"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="px-6 pb-4 flex gap-3 overflow-x-auto">
                      {order.items?.slice(0, 4).map(item => (
                        <div key={item.id} className="flex items-center gap-2 flex-shrink-0 p-2 rounded-xl"
                          style={{ backgroundColor: "#F8F5FF" }}>
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                            style={{ backgroundColor: "#e2e8f0" }}>
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name}
                                className="w-full h-full object-cover" />
                            ) : <span className="text-lg flex items-center justify-center h-full opacity-30">📦</span>}
                          </div>
                          <div>
                            <p className="text-xs font-semibold w-24 truncate" style={{ color: "#1A0A2E" }}>
                              {item.product_name}
                            </p>
                            <p className="text-xs" style={{ color: "#718096" }}>×{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="flex items-center justify-center w-16 h-16 rounded-xl flex-shrink-0"
                          style={{ backgroundColor: "#F8F5FF", color: "#718096", fontSize: "12px" }}>
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t px-6 py-5" style={{ borderColor: "#e2e8f0" }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-bold mb-3 text-sm" style={{ color: "#1A0A2E" }}>
                              Items ({order.items?.length})
                            </h3>
                            <div className="flex flex-col gap-2">
                              {order.items?.map(item => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span style={{ color: "#4A5568" }}>
                                    {item.product_name} ×{item.quantity}
                                  </span>
                                  <span className="font-semibold" style={{ color: "#1A0A2E" }}>
                                    ETB {parseFloat(item.subtotal).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                              <div className="h-px my-1" style={{ backgroundColor: "#e2e8f0" }} />
                              <div className="flex justify-between text-sm">
                                <span style={{ color: "#718096" }}>Shipping</span>
                                <span style={{ color: "#1A0A2E" }}>
                                  {parseFloat(order.shipping_fee) === 0
                                    ? "FREE"
                                    : `ETB ${parseFloat(order.shipping_fee).toLocaleString()}`}
                                </span>
                              </div>
                              <div className="flex justify-between font-bold">
                                <span style={{ color: "#1A0A2E" }}>Total</span>
                                <span style={{ color: "#3B1F6E" }}>
                                  ETB {parseFloat(order.total).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {address && (
                            <div>
                              <h3 className="font-bold mb-3 text-sm" style={{ color: "#1A0A2E" }}>
                                Shipping Address
                              </h3>
                              <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "#F8F5FF" }}>
                                <p className="font-semibold" style={{ color: "#1A0A2E" }}>{address.full_name}</p>
                                <p style={{ color: "#4A5568" }}>{address.phone}</p>
                                <p style={{ color: "#4A5568" }}>
                                  {[address.street, address.woreda && `Woreda ${address.woreda}`,
                                    address.sub_city, address.city].filter(Boolean).join(", ")}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={5}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}