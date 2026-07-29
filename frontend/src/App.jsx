// App.jsx

import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ProductsPage from "./pages/ProductsPage";
import ProductPage from "./pages/ProductPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";

import ProtectedRoute from "./components/ProtectedRoute";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import OrderSuccess from "./pages/OrderSuccess";
import CheckoutPage from "./pages/CheckoutPage";

import OrdersPage from "./pages/OrdersPage";

import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminRoute from "./components/AdminRoute";
import ProductForm from "./pages/admin/ProductForm";

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
          path="/admin"
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
        </Route>

        <Route
    path="/admin/products/new"
    element={
        <AdminRoute>
            <ProductForm />
        </AdminRoute>
    }
/>

<Route
    path="/admin/products/:id/edit"
    element={
        <AdminRoute>
            <ProductForm />
        </AdminRoute>
    }
/>

      </Routes>

      <Footer />
    </>
  );
}