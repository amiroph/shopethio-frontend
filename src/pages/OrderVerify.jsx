import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import API from "../utils/api";
import Navbar from "../components/Navbar";

export default function OrderVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("verifying");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const txRef = params.get("tx_ref");
    if (!txRef) { navigate("/"); return; }
    verifyPayment(txRef);
  }, []);

  const verifyPayment = async (txRef) => {
    try {
      const res = await API.get(`/orders/verify/${txRef}`);
      setStatus(res.data.status);
      if (res.data.status === "paid" && res.data.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      setStatus("failed");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (status === "verifying") return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />
      <div className="flex items-center justify-center px-6 py-20">
        <div className="rounded-3xl p-12 max-w-md w-full text-center shadow-xl"
          style={{ backgroundColor: "#ffffff" }}>
          <div className="text-6xl mb-6 animate-pulse">⏳</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A0A2E" }}>
            Verifying Payment...
          </h2>
          <p style={{ color: "#718096" }}>Please wait while we confirm your payment</p>
        </div>
      </div>
    </div>
  );

  if (status === "failed") return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />
      <div className="flex items-center justify-center px-6 py-20">
        <div className="rounded-3xl p-12 max-w-md w-full text-center shadow-xl"
          style={{ backgroundColor: "#ffffff" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #C53030, #FC8181)" }}>❌</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#1A0A2E" }}>
            Payment Failed
          </h2>
          <p className="mb-6" style={{ color: "#718096" }}>
            Your payment was not completed. Your order has been saved — you can retry from your orders page.
          </p>
          <div className="flex gap-3">
            <Link to="/orders"
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white text-center"
              style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)", textDecoration: "none" }}>
              My Orders
            </Link>
            <Link to="/cart"
              className="flex-1 py-3 rounded-xl font-bold text-sm text-center"
              style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E", textDecoration: "none", border: "1px solid #e2e8f0" }}>
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#F8F5FF", minHeight: "100vh" }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Success Header */}
        <div className="rounded-2xl p-8 text-center mb-6"
          style={{ background: "linear-gradient(135deg, #276749, #48BB78)" }}>
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl mx-auto mb-4">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p style={{ color: "rgba(255,255,255,0.85)" }}>
            Your order has been placed and payment confirmed.
          </p>
        </div>

        {/* Receipt Card */}
        <div id="receipt" className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>

          {/* Receipt Header */}
          <div className="px-8 py-6 border-b flex items-center justify-between"
            style={{ borderColor: "#e2e8f0", backgroundColor: "#F8F5FF" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: "#3B1F6E", color: "#D4A017" }}>SE</div>
              <div>
                <p className="font-bold text-lg" style={{ color: "#1A0A2E" }}>ShopEthio</p>
                <p className="text-xs" style={{ color: "#718096" }}>Payment Receipt</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: "#718096" }}>Date</p>
              <p className="text-sm font-bold" style={{ color: "#1A0A2E" }}>
                {new Date().toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric"
                })}
              </p>
            </div>
          </div>

          <div className="px-8 py-6">

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl"
              style={{ backgroundColor: "#F8F5FF" }}>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#718096" }}>Order Number</p>
                <p className="font-bold" style={{ color: "#1A0A2E" }}>
                  #{order?.order_number || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#718096" }}>Payment Status</p>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#F0FFF4", color: "#276749" }}>
                  ✅ Paid
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#718096" }}>Payment Method</p>
                <p className="font-semibold text-sm" style={{ color: "#1A0A2E" }}>Chapa</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#718096" }}>Order Status</p>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#EBF8FF", color: "#2C5282" }}>
                  ⚙️ Processing
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            {order?.shipping_address && (
              <div className="mb-6">
                <p className="text-sm font-bold mb-3" style={{ color: "#1A0A2E" }}>
                  📍 Shipping Address
                </p>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#F8F5FF" }}>
                  {(() => {
                    const addr = typeof order.shipping_address === "string"
                      ? JSON.parse(order.shipping_address)
                      : order.shipping_address;
                    return (
                      <div className="text-sm" style={{ color: "#4A5568" }}>
                        <p className="font-semibold" style={{ color: "#1A0A2E" }}>{addr.full_name}</p>
                        <p>{addr.phone}</p>
                        <p>{[addr.street, addr.woreda && `Woreda ${addr.woreda}`,
                          addr.sub_city, addr.city].filter(Boolean).join(", ")}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Order Items */}
            {order?.items && order.items.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-bold mb-3" style={{ color: "#1A0A2E" }}>
                  📦 Items Ordered
                </p>
                <div className="flex flex-col gap-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: "#F8F5FF" }}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: "#e2e8f0" }}>
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name}
                            className="w-full h-full object-cover" />
                        ) : <span className="text-xl flex items-center justify-center h-full opacity-30">📦</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: "#1A0A2E" }}>
                          {item.product_name}
                        </p>
                        <p className="text-xs" style={{ color: "#718096" }}>
                          ETB {parseFloat(item.price).toLocaleString()} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-sm flex-shrink-0" style={{ color: "#3B1F6E" }}>
                        ETB {parseFloat(item.subtotal).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="border-t pt-5" style={{ borderColor: "#e2e8f0" }}>
              <p className="text-sm font-bold mb-3" style={{ color: "#1A0A2E" }}>
                💰 Payment Summary
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#718096" }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: "#1A0A2E" }}>
                    ETB {parseFloat(order?.subtotal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#718096" }}>Shipping Fee</span>
                  <span className="font-semibold"
                    style={{ color: parseFloat(order?.shipping_fee) === 0 ? "#276749" : "#1A0A2E" }}>
                    {parseFloat(order?.shipping_fee) === 0
                      ? "FREE"
                      : `ETB ${parseFloat(order?.shipping_fee).toLocaleString()}`}
                  </span>
                </div>
                <div className="h-px my-1" style={{ backgroundColor: "#e2e8f0" }} />
                <div className="flex justify-between font-bold text-lg">
                  <span style={{ color: "#1A0A2E" }}>Total Paid</span>
                  <span style={{ color: "#3B1F6E" }}>
                    ETB {parseFloat(order?.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Thank you note */}
            <div className="mt-6 p-4 rounded-xl text-center"
              style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)" }}>
              <p className="text-white font-semibold">Thank you for shopping with ShopEthio! 🎉</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                We'll notify you when your order is shipped.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button onClick={handlePrint}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)", color: "#ffffff" }}>
            🖨️ Print / Save Receipt
          </button>
          <Link to="/orders"
            className="flex-1 py-3 rounded-xl font-bold text-sm text-center transition hover:opacity-90"
            style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E", textDecoration: "none", border: "1px solid #e2e8f0" }}>
            📋 My Orders
          </Link>
          <Link to="/products"
            className="flex-1 py-3 rounded-xl font-bold text-sm text-center transition hover:opacity-90"
            style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E", textDecoration: "none", border: "1px solid #e2e8f0" }}>
            🛍️ Shop More
          </Link>
        </div>

        {/* Tips */}
<div className="rounded-2xl p-5 mt-4"
  style={{ backgroundColor: "#FFF8E1", border: "1px solid #FAD089" }}>
  <p className="font-bold text-sm mb-3" style={{ color: "#B7791F" }}>
    💡 How to save your receipts
  </p>
  <div className="flex flex-col gap-2">
    {[
      "Click \"Print / Save Receipt\" above to save this receipt as PDF",
      "To get the Chapa payment receipt: check your registered email — Chapa sends a payment confirmation email automatically",
      "You can also find your order anytime in My Orders page",
    ].map((tip, i) => (
      <div key={i} className="flex items-start gap-2">
        <span className="text-sm font-bold flex-shrink-0" style={{ color: "#D4A017" }}>
          {i + 1}.
        </span>
        <p className="text-sm" style={{ color: "#4A5568" }}>{tip}</p>
      </div>
    ))}
  </div>
</div>
      </div>
    </div>
  );
}