// App.jsx

import { Routes, Route } from "react-router-dom";

import Home from "../features/home/pages/Home";
import ProductsPage from "../features/catalog/pages/ProductsPage";
import ProductPage from "../features/catalog/pages/ProductPage";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import CartPage from "../features/cart/pages/CartPage";

import ProtectedRoute from "../features/auth/components/ProtectedRoute";

import Header from "../shared/components/layout/Header";
import Footer from "../shared/components/layout/Footer";

import OrderSuccess from "../features/orders/pages/OrderSuccess";
import CheckoutPage from "../features/orders/pages/CheckoutPage";

import OrdersPage from "../features/orders/pages/OrdersPage";

import AdminLayout from "../features/admin/components/AdminLayout";
import Dashboard from "../features/admin/pages/Dashboard";
import AdminRoute from "../features/admin/components/AdminRoute";
import ProductForm from "../features/admin/pages/ProductForm";
import AdminProductsPage from "../features/admin/pages/AdminProductsPage";
import AdminCategoriesPage from "../features/admin/pages/AdminCategoriesPage";
import AdminOrdersPage from "../features/admin/pages/AdminOrdersPage";

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/products"
          element={<ProductsPage />}
        />

        <Route
          path="/products/:id"
          element={<ProductPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-panel"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route
            index
            element={<Dashboard />}
          />
          <Route
            path="products"
            element={<AdminProductsPage />}
          />
          <Route
            path="products/new"
            element={<ProductForm />}
          />
          <Route
            path="products/:id/edit"
            element={<ProductForm />}
          />
          <Route
            path="categories"
            element={<AdminCategoriesPage />}
          />
          <Route
            path="orders"
            element={<AdminOrdersPage />}
          />
        </Route>

      </Routes>

      <Footer />
    </>
  );
}
