# 🛒 ShopEthio — Ethiopian E-Commerce Platform

> Shop Smart, Shop Ethiopian — A full-stack e-commerce platform built for the Ethiopian market with real Chapa payment integration.

![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![Chapa](https://img.shields.io/badge/Payment-Chapa-purple)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

🌐 **Live Demo:** [https://shopethio-frontend.vercel.app](https://shopethio-frontend.vercel.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Author](#author)

---

## 📖 Overview

ShopEthio is a production-ready full-stack e-commerce platform designed specifically for the Ethiopian market. It features a complete shopping experience for customers, a powerful admin dashboard for store management, and real ETB payment processing through the Chapa payment gateway.

The platform was built entirely from scratch as a solo project — covering database design, REST API architecture, frontend development, Cloudinary image storage, Chapa payment integration, and full cloud deployment.

---

## ✨ Features

### 🛍️ Customer Side
- Browse products with search, category filters, price range, and sorting
- Persistent shopping cart saved in the database
- Wishlist with pagination
- Checkout with **Chapa payment gateway** — real ETB transactions
- Order receipt page with print / save as PDF functionality
- Order history and tracking with expandable order details
- User profile with avatar upload via Cloudinary
- Change password from account settings
- Session timeout with 60-second countdown warning modal (10 min inactivity)
- Product ratings and reviews

### 🔧 Admin Side
- Dashboard with 6 KPI cards — total revenue, orders, products, customers, pending orders, low stock
- Product management — add, edit, delete, toggle active/inactive, multi-image upload (up to 5 images per product)
- Category management — add, edit, delete, image upload, toggle visibility
- Order management — view all orders, filter by status and payment, update order status
- Customer management — view spending history, block or unblock customers
- Sales reports — revenue bar chart (last 7 days), orders by status breakdown, top 5 selling products
- CSV export for reports

### ⚙️ Technical Highlights
- JWT authentication with automatic session timeout
- Pagination on all listings — products (12/page), orders (5/page), wishlist (12/page), admin tables (10/page)
- Cloudinary image storage for products, categories, and user avatars
- Free delivery threshold — orders over ETB 500 get free shipping
- CORS protection with exact origin matching
- Rate limiting and Helmet security headers
- React Router SPA routing fixed for Vercel with vercel.json rewrites

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT + bcryptjs |
| Image Storage | Cloudinary (multer-storage-cloudinary) |
| Payment Gateway | Chapa (Ethiopian payment gateway) |
| Security | Helmet, express-rate-limit |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |
| Database Host | Clever Cloud |

---

## 🏗️ Project Structure

shopethio/
│
├── frontend/                        # React + Vite + Tailwind CSS
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Sticky navbar with cart badge and user dropdown
│   │   │   ├── Footer.jsx           # 4-column footer
│   │   │   ├── AdminLayout.jsx      # Admin sidebar layout
│   │   │   ├── Pagination.jsx       # Reusable pagination with showing X-Y of Z
│   │   │   └── ProtectedRoute.jsx   # Role-based route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # JWT auth + session timeout modal
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Hero slideshow, categories, featured products
│   │   │   ├── Login.jsx            # Split panel login
│   │   │   ├── Register.jsx         # Split panel registration
│   │   │   ├── Products.jsx         # Product grid with sidebar filters
│   │   │   ├── ProductDetail.jsx    # Image gallery, add to cart, reviews
│   │   │   ├── Cart.jsx             # Cart with quantity controls and order summary
│   │   │   ├── Checkout.jsx         # Ethiopian address form + Chapa payment
│   │   │   ├── OrderVerify.jsx      # Payment verification + full receipt
│   │   │   ├── Orders.jsx           # Order history with expandable details
│   │   │   ├── Account.jsx          # Profile, orders, security tabs
│   │   │   ├── Wishlist.jsx         # Saved products grid
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminCategories.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       ├── AdminCustomers.jsx
│   │   │       └── AdminReports.jsx
│   │   └── utils/
│   │       └── api.js               # Axios instance with JWT interceptor
│   ├── vercel.json                  # SPA routing rewrites for React Router
│   └── .env                         # VITE_API_URL
│
└── backend/                         # Node.js + Express
└── src/
├── config/
│   ├── db.js                # MySQL pool connection
│   └── cloudinary.js        # Multer + Cloudinary storage configs
├── middleware/
│   ├── auth.js              # protect + authorize middleware
│   └── rateLimiter.js       # Login and API rate limiters
└── routes/
├── auth.js              # POST /register, POST /login, GET /me
├── public.js            # Stats, categories, products (public)
├── customer.js          # Cart, wishlist, profile, avatar, reviews
├── orders.js            # Place order, Chapa verify, my orders, cancel
└── admin.js             # Full admin CRUD + reports

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- Cloudinary account (free tier works)
- Chapa account — [dashboard.chapa.co](https://dashboard.chapa.co)

### 1. Clone the repositories

```bash
git clone https://github.com/amiroph/shopethio-backend.git
git clone https://github.com/amiroph/shopethio-frontend.git
```

### 2. Set up the backend

```bash
cd shopethio-backend
npm install
```

Create a `.env` file in the backend root (see [Environment Variables](#environment-variables) below).

Run the MySQL schema in MySQL Workbench or your MySQL client:

```sql
CREATE DATABASE shopethio;
USE shopethio;
-- then run the full schema to create all tables
-- tables: users, categories, products, product_images,
--         cart_items, wishlists, orders, order_items, reviews, addresses
```

Seed the admin user (password: Admin@2026):

```sql
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@shopethio.com',
'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
```

Start the backend server:

```bash
npm run dev
# Server runs on http://localhost:5000
# Test: http://localhost:5000/api/health
```

### 3. Set up the frontend

```bash
cd shopethio-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 🔐 Environment Variables

### Backend `.env`

```env
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_PORT=3306
DB_NAME=shopethio

# JWT
JWT_SECRET=shopethio_secret_key_2026
JWT_EXPIRES_IN=7d

# CORS — no trailing slash
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Chapa Payment Gateway
CHAPA_SECRET_KEY=CHASECK_TEST-your_test_key
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Public — No authentication required

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Platform statistics |
| GET | `/api/categories` | All active categories |
| GET | `/api/products` | Products with filters and pagination |
| GET | `/api/products/:slug` | Single product with images and reviews |
| GET | `/api/featured-products` | Featured products for homepage |

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current authenticated user |

### Customer — JWT required

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customer/cart` | Get cart items |
| POST | `/api/customer/cart` | Add item to cart |
| PUT | `/api/customer/cart/:id` | Update cart item quantity |
| DELETE | `/api/customer/cart/:id` | Remove item from cart |
| DELETE | `/api/customer/cart` | Clear entire cart |
| GET | `/api/customer/wishlist` | Get wishlist with pagination |
| POST | `/api/customer/wishlist` | Add product to wishlist |
| DELETE | `/api/customer/wishlist/:productId` | Remove from wishlist |
| GET | `/api/customer/profile` | Get profile |
| PUT | `/api/customer/profile` | Update name and phone |
| PUT | `/api/customer/avatar` | Upload profile picture |
| PUT | `/api/customer/change-password` | Change password |
| POST | `/api/customer/reviews` | Submit product review |

### Orders — JWT required

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Place order and initialize Chapa payment |
| GET | `/api/orders/verify/:txRef` | Verify Chapa payment and return receipt |
| GET | `/api/orders/my` | Get my orders with pagination |
| GET | `/api/orders/:id` | Get single order details |
| PUT | `/api/orders/:id/cancel` | Cancel a pending order |

### Admin — JWT + admin role required

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | Dashboard KPI stats |
| GET | `/api/admin/categories` | All categories with product count |
| POST | `/api/admin/categories` | Create category with image |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
| GET | `/api/admin/products` | Products with search and pagination |
| POST | `/api/admin/products` | Create product with images |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product and Cloudinary images |
| GET | `/api/admin/orders` | All orders with filters and pagination |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/customers` | All customers with pagination |
| PUT | `/api/admin/customers/:id/toggle` | Block or unblock customer |
| GET | `/api/admin/reports` | Revenue, top products, orders by status |

---

## 🌍 Deployment

| Layer | Platform | URL |
|---|---|---|
| Frontend | Vercel | [shopethio-frontend.vercel.app](https://shopethio-frontend.vercel.app) |
| Backend | Render | [shopethio-backend.onrender.com](https://shopethio-backend.onrender.com) |
| Database | Clever Cloud | MySQL managed instance |
| Images | Cloudinary | Folder: `shopethio/` |

### Important deployment notes

- `vercel.json` must rewrite all routes to `/index.html` for React Router to work
- `CLIENT_URL` on Render must **not** have a trailing slash — `https://shopethio-frontend.vercel.app` not `https://shopethio-frontend.vercel.app/`
- Chapa `return_url` and `callback_url` must point to the live Vercel frontend URL
- Use `CHASECK_TEST-` prefix for test mode, `CHASECK-` for live mode

---

## 👨‍💻 Author

**Amanuel Adamu Shifera**

- 🌐 Portfolio: [amiroph.github.io](https://amiroph.github.io/amanueladamu.github.io/)
- 💼 GitHub: [@amiroph](https://github.com/amiroph)
- ✉️ Email: amannice77@gmail.com
- 📞 Phone: +251-924073032

---

## 📄 License

This project is built for portfolio and demonstration purposes.