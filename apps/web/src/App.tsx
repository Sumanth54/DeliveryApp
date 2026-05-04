import { Suspense, lazy, useCallback, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { HomePage } from "./pages/HomePage";

const LoginModal = lazy(() =>
  import("./components/LoginModal").then((module) => ({ default: module.LoginModal }))
);
const CartPage = lazy(() =>
  import("./pages/CartPage").then((module) => ({ default: module.CartPage }))
);
const OrdersPage = lazy(() =>
  import("./pages/OrdersPage").then((module) => ({ default: module.OrdersPage }))
);
const OrderConfirmationPage = lazy(() =>
  import("./pages/OrderConfirmationPage").then((module) => ({
    default: module.OrderConfirmationPage
  }))
);
const AdminDashboardPage = lazy(() =>
  import("./pages/AdminDashboardPage").then((module) => ({
    default: module.AdminDashboardPage
  }))
);

function RouteFallback() {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-sm font-medium text-stone-600 shadow-card">
      Loading page...
    </div>
  );
}

function AppRoutes() {
  const [loginOpen, setLoginOpen] = useState(false);
  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  return (
    <>
      <Suspense fallback={null}>
        {loginOpen ? <LoginModal onClose={closeLogin} open={loginOpen} /> : null}
      </Suspense>
      <Routes>
        <Route element={<AppShell fallback={<RouteFallback />} onOpenLogin={openLogin} />} path="/">
          <Route element={<HomePage />} index />
          <Route element={<CartPage onOpenLogin={openLogin} />} path="cart" />
          <Route element={<OrdersPage onOpenLogin={openLogin} />} path="orders" />
          <Route
            element={<OrderConfirmationPage />}
            path="order-confirmation/:id"
          />
          <Route
            element={<AdminDashboardPage onOpenLogin={openLogin} />}
            path="admin"
          />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
