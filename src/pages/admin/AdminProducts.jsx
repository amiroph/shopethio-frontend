import { useEffect, useState, useRef } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import Pagination from "../../components/Pagination";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [search, filterCat]);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/admin/categories");
      setCategories(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/admin/products", {
        params: { page, search, category: filterCat },
      });
      setProducts(res.data.data);
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
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/admin/products/${deleteId}`);
      setDeleteId(null);
      fetchProducts(currentPage);
    } catch (err) { alert("Failed to delete"); }
  };

  const handleToggle = async (product) => {
    try {
      await API.put(`/admin/products/${product.id}`, {
        ...product, is_active: !product.is_active,
      });
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p)
      );
    } catch (err) { alert("Failed to update"); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>Products</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            {pagination.total} products
          </p>
        </div>
        <button onClick={() => { setEditData(null); setShowModal(true); }}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)" }}>
          ➕ Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#1A0A2E" }}
          onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
          onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#1A0A2E" }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#F8F5FF", borderBottom: "1px solid #e2e8f0" }}>
              {["Product", "Category", "Price", "Stock", "Sold", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#718096" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="px-5 py-12 text-center" style={{ color: "#718096" }}>
                Loading...
              </td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="7" className="px-5 py-12 text-center">
                <p className="text-3xl mb-2">📦</p>
                <p style={{ color: "#718096" }}>No products found</p>
              </td></tr>
            ) : products.map((p, i) => (
              <tr key={p.id}
                style={{ borderBottom: i < products.length - 1 ? "1px solid #e2e8f0" : "none" }}
                className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: "#F8F5FF" }}>
                      {p.primary_image ? (
                        <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" />
                      ) : <span className="text-2xl flex items-center justify-center h-full opacity-30">📦</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#1A0A2E" }}>{p.name}</p>
                      {p.brand && <p className="text-xs" style={{ color: "#718096" }}>{p.brand}</p>}
                      {p.is_featured && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: "#FFF8E1", color: "#D4A017" }}>⭐ Featured</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>
                  {p.category_name || "—"}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-sm" style={{ color: "#3B1F6E" }}>
                    ETB {parseFloat(p.price).toLocaleString()}
                  </p>
                  {p.original_price && (
                    <p className="text-xs line-through" style={{ color: "#A0AEC0" }}>
                      ETB {parseFloat(p.original_price).toLocaleString()}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className="font-semibold text-sm"
                    style={{ color: p.stock <= 5 ? "#C53030" : p.stock <= 20 ? "#B7791F" : "#276749" }}>
                    {p.stock}
                  </span>
                  {p.stock <= 5 && <span className="ml-1 text-xs">⚠️</span>}
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: "#4A5568" }}>{p.sold}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleToggle(p)}>
                    <div className="w-9 h-5 rounded-full relative transition-all"
                      style={{ backgroundColor: p.is_active ? "#5A2D9C" : "#CBD5E0" }}>
                      <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all"
                        style={{ left: p.is_active ? "20px" : "2px" }} />
                    </div>
                    <span className="text-xs font-semibold"
                      style={{ color: p.is_active ? "#5A2D9C" : "#C53030" }}>
                      {p.is_active ? "Active" : "Off"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditData(p); setShowModal(true); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                      style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E", border: "1px solid #e2e8f0" }}>
                      Edit
                    </button>
                    <button onClick={() => setDeleteId(p.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80"
                      style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
                      Delete
                    </button>
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

      {showModal && (
        <ProductModal editData={editData} categories={categories}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchProducts(currentPage); }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl p-8 max-w-sm w-full mx-4" style={{ backgroundColor: "#ffffff" }}>
            <p className="text-4xl text-center mb-4">⚠️</p>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: "#1A0A2E" }}>
              Delete Product?
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: "#718096" }}>
              This will also delete all product images from Cloudinary.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete}
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
                style={{ backgroundColor: "#C53030" }}>Delete</button>
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#F8F5FF", color: "#718096", border: "1px solid #e2e8f0" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function ProductModal({ editData, categories, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: editData?.name || "",
    description: editData?.description || "",
    price: editData?.price || "",
    original_price: editData?.original_price || "",
    stock: editData?.stock || "",
    category_id: editData?.category_id || "",
    brand: editData?.brand || "",
    is_featured: editData?.is_featured || false,
    is_active: editData?.is_active ?? true,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    setError("");
  };

  const removePreview = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      imageFiles.forEach(file => formData.append("images", file));
      if (editData) {
        await API.put(`/admin/products/${editData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await API.post("/admin/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    border: "1px solid #e2e8f0", backgroundColor: "#F8F5FF", color: "#1A0A2E",
    width: "100%", padding: "10px 14px", borderRadius: "10px", fontSize: "14px", outline: "none",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-2xl rounded-2xl p-8 max-h-screen overflow-y-auto"
        style={{ backgroundColor: "#ffffff" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#1A0A2E" }}>
            {editData ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} style={{ color: "#718096", fontSize: "20px" }}>✕</button>
        </div>

        {error && (
          <div className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image Upload */}
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: "#1A0A2E" }}>
              Product Images (max 5)
            </label>
            {imagePreviews.length > 0 && (
              <div className="flex gap-3 flex-wrap mb-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden"
                    style={{ border: "2px solid #e2e8f0" }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePreview(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: "#C53030", color: "#ffffff" }}>✕</button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs px-1 rounded font-bold"
                        style={{ backgroundColor: "#D4A017", color: "#1A0A2E" }}>Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div onClick={() => fileInputRef.current.click()}
              className="flex items-center justify-center gap-2 rounded-xl cursor-pointer"
              style={{ height: "80px", border: "2px dashed #e2e8f0", backgroundColor: "#F8F5FF" }}>
              <span className="text-2xl">📸</span>
              <p className="text-sm font-semibold" style={{ color: "#5A2D9C" }}>Click to upload</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple
              onChange={handleImageChange} className="hidden" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Product Name *</label>
              <input style={inputStyle} required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Price (ETB) *</label>
              <input type="number" style={inputStyle} required value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Original Price (ETB)</label>
              <input type="number" style={inputStyle} value={form.original_price}
                onChange={e => setForm({ ...form, original_price: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Stock *</label>
              <input type="number" style={inputStyle} required value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Brand</label>
              <input style={inputStyle} value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Category</label>
              <select style={inputStyle} value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Select category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>Description</label>
              <textarea style={{ ...inputStyle, resize: "none" }} rows={4}
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
                onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
            </div>
            <div className="col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured}
                  onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm font-semibold" style={{ color: "#1A0A2E" }}>⭐ Featured</span>
              </label>
              {editData && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm font-semibold" style={{ color: "#1A0A2E" }}>Active</span>
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: loading ? "#A0AEC0" : "linear-gradient(135deg, #3B1F6E, #5A2D9C)" }}>
              {loading ? "Saving..." : editData ? "Update Product" : "Add Product"}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#F8F5FF", color: "#718096", border: "1px solid #e2e8f0" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}