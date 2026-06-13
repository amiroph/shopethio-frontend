import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderVerify from "./pages/OrderVerify";
import Orders from "./pages/Orders";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminReports from "./pages/admin/AdminReports";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />

      {/* Customer */}
      <Route path="/checkout" element={
        <ProtectedRoute role={["customer"]}><Checkout /></ProtectedRoute>
      } />
      <Route path="/orders/verify" element={
        <ProtectedRoute role={["customer"]}><OrderVerify /></ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute role={["customer"]}><Orders /></ProtectedRoute>
      } />
      <Route path="/account" element={
        <ProtectedRoute role={["customer"]}><Account /></ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute role={["customer"]}><Wishlist /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute role={["admin"]}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedRoute role={["admin"]}><AdminProducts /></ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute role={["admin"]}><AdminCategories /></ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute role={["admin"]}><AdminOrders /></ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
        <ProtectedRoute role={["admin"]}><AdminCustomers /></ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute role={["admin"]}><AdminReports /></ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;