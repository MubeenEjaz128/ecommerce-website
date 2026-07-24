import { Navigate, Route, Routes } from "react-router-dom";
import { useThemeBootstrap } from "./hooks/useThemeBootstrap";
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/public/HomePage";
import ShopPage from "./pages/public/ShopPage";
import CartPage from "./pages/public/CartPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import CheckoutPage from "./pages/public/CheckoutPage";
import CheckoutSuccess from "./pages/public/CheckoutSuccess";
import OrdersPage from "./pages/public/OrdersPage";
import OrderDetailsPage from "./pages/public/OrderDetailsPage";
import WishlistPage from "./pages/public/WishlistPage";
import ProductDetailsPage from "./pages/public/ProductDetailsPage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import RegistryPage from "./pages/public/RegistryPage";
import GiftCardsPage from "./pages/public/GiftCardsPage";
import BlogPage from "./pages/public/BlogPage";
import PolicyPage from "./pages/public/PolicyPage";
import NotFoundPage from "./pages/system/NotFoundPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/ProductsPage";
import AdminOrders from "./pages/admin/OrdersPage";
import AdminProductEditor from "./pages/admin/ProductEditor";
import BrandsPage from "./pages/admin/BrandsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";

import DealsPage from "./pages/public/DealsPage";
import CollectionPage from "./pages/public/CollectionPage";
import CategoriesBrowsePage from "./pages/public/CategoriesBrowsePage";

function App() {
  useThemeBootstrap();

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="collection" element={<CollectionPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="categories" element={<CategoriesBrowsePage />} />
        <Route path="deals" element={<DealsPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="checkout/success" element={<CheckoutSuccess />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="product/:idOrSlug" element={<ProductDetailsPage />} />

        <Route path="products/:slug" element={<ProductDetailsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="registry" element={<RegistryPage />} />
        <Route path="gift-cards" element={<GiftCardsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="policies/:slug" element={<PolicyPage />} />
      </Route>
      
      {/* Admin Routes - Completely separate from PublicLayout */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductEditor />} />
        <Route path="products/:id/edit" element={<AdminProductEditor />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;