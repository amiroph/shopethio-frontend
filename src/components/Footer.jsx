import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#1A0A2E" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>SE</div>
              <span className="text-xl font-bold text-white">
                Shop<span style={{ color: "#D4A017" }}>Ethio</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Ethiopia's premium online marketplace. Shop smart, shop local, shop Ethiopian.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: "All Products", path: "/products" },
                { label: "Categories", path: "/products" },
                { label: "Best Sellers", path: "/products?sort=popular" },
                { label: "New Arrivals", path: "/products?sort=newest" },
              ].map(l => (
                <Link key={l.path + l.label} to={l.path}
                  className="text-sm transition hover:opacity-100"
                  style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Customer Service</h4>
            <div className="flex flex-col gap-2">
              {["My Account", "My Orders", "Track Order", "Returns & Refunds"].map(item => (
                <span key={item} className="text-sm cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.5)" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <div className="flex flex-col gap-3">
              {[
                { icon: "📍", text: "Addis Ababa, Ethiopia" },
                { icon: "✉️", text: "support@shopethio.com" },
                { icon: "📞", text: "+251 911 000 000" },
                { icon: "🕐", text: "Mon-Sat: 9am - 7pm" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="py-6 border-t border-b flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Secure Payment Methods:
          </p>
          <div className="flex items-center gap-3">
            {["Chapa", "TeleBirr", "CBE Birr", "M-Pesa"].map(pay => (
              <span key={pay}
                className="px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{ backgroundColor: "rgba(212,160,23,0.15)", color: "#D4A017", border: "1px solid rgba(212,160,23,0.3)" }}>
                {pay}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            © 2026 ShopEthio. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(item => (
              <span key={item} className="text-sm cursor-pointer"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}