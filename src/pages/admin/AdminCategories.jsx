import { useEffect, useState, useRef } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/categories");
      setCategories(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/admin/categories/${deleteId}`);
      setCategories(prev => prev.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (err) { alert("Failed to delete"); }
  };

  const handleToggle = async (cat) => {
    try {
      const formData = new FormData();
      formData.append("name", cat.name);
      formData.append("description", cat.description || "");
      formData.append("is_active", !cat.is_active);
      await API.put(`/admin/categories/${cat.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setCategories(prev => prev.map(c =>
        c.id === cat.id ? { ...c, is_active: !c.is_active } : c
      ));
    } catch (err) { alert("Failed to update"); }
  };

  const CAT_ICONS = {
    "electronics": "💻",
    "fashion": "👗",
    "home-living": "🏠",
    "health-beauty": "💄",
    "sports-outdoors": "⚽",
    "books-education": "📚",
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A0A2E" }}>Categories</h1>
          <p className="text-sm mt-1" style={{ color: "#718096" }}>
            {categories.length} categories
          </p>
        </div>
        <button onClick={() => { setEditData(null); setShowModal(true); }}
          className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #3B1F6E, #5A2D9C)" }}>
          ➕ Add Category
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: "#718096" }}>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(cat => (
            <div key={cat.id} className="rounded-2xl p-6 transition hover:shadow-md"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ backgroundColor: "#F8F5FF" }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (CAT_ICONS[cat.slug] || "📦")}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditData(cat); setShowModal(true); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E", border: "1px solid #e2e8f0" }}>
                    Edit
                  </button>
                  <button onClick={() => setDeleteId(cat.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7" }}>
                    Delete
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: "#1A0A2E" }}>{cat.name}</h3>
              <p className="text-sm mb-4" style={{ color: "#718096" }}>
                {cat.description || "No description"}
              </p>
              <div className="flex items-center justify-between pt-4"
                style={{ borderTop: "1px solid #e2e8f0" }}>
                <span className="text-sm font-semibold" style={{ color: "#5A2D9C" }}>
                  {cat.total_products} products
                </span>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleToggle(cat)}>
                  <div className="w-9 h-5 rounded-full relative"
                    style={{ backgroundColor: cat.is_active ? "#5A2D9C" : "#CBD5E0" }}>
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all"
                      style={{ left: cat.is_active ? "20px" : "2px" }} />
                  </div>
                  <span className="text-xs font-semibold"
                    style={{ color: cat.is_active ? "#5A2D9C" : "#C53030" }}>
                    {cat.is_active ? "Active" : "Hidden"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CategoryModal editData={editData}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchCategories(); }} />
      )}

      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="rounded-2xl p-8 max-w-sm w-full mx-4" style={{ backgroundColor: "#ffffff" }}>
            <p className="text-4xl text-center mb-4">⚠️</p>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: "#1A0A2E" }}>
              Delete Category?
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: "#718096" }}>
              Products in this category will be uncategorized.
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

function CategoryModal({ editData, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: editData?.name || "",
    description: editData?.description || "",
    is_active: editData?.is_active ?? true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editData?.image || null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) formData.append("image", imageFile);
      if (editData) {
        await API.put(`/admin/categories/${editData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await API.post("/admin/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
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
      <div className="w-full max-w-md rounded-2xl p-8" style={{ backgroundColor: "#ffffff" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#1A0A2E" }}>
            {editData ? "Edit Category" : "Add Category"}
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
          {/* Image */}
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: "#1A0A2E" }}>
              Category Image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-3xl flex-shrink-0"
                style={{ backgroundColor: "#F8F5FF", border: "2px dashed #e2e8f0" }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : "📦"}
              </div>
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer text-sm font-semibold"
                style={{ backgroundColor: "#F8F5FF", color: "#3B1F6E", border: "2px dashed #e2e8f0" }}>
                📁 {imageFile ? imageFile.name : "Choose Image"}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
              Name *
            </label>
            <input style={inputStyle} required placeholder="e.g. Electronics"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1" style={{ color: "#1A0A2E" }}>
              Description
            </label>
            <textarea style={{ ...inputStyle, resize: "none" }} rows={3}
              placeholder="Brief description..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              onFocus={e => e.target.style.border = "1.5px solid #5A2D9C"}
              onBlur={e => e.target.style.border = "1px solid #e2e8f0"} />
          </div>
          {editData && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4" />
              <span className="text-sm font-semibold" style={{ color: "#1A0A2E" }}>Active</span>
            </label>
          )}
          <div className="flex gap-3 mt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: loading ? "#A0AEC0" : "linear-gradient(135deg, #3B1F6E, #5A2D9C)" }}>
              {loading ? "Saving..." : editData ? "Update" : "Create"}
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