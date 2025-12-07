import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Auth from "./pages/Auth.jsx";
import Bookings from "./pages/Bookings.jsx";
import AdminEvents from "./pages/AdminEvents.jsx";
import AdminEventEdit from "./pages/AdminEventEdit.jsx";
import Profile from "./pages/Profile.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const App = () => (
  <AuthProvider>
    <div className="min-h-screen pb-10">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute adminOnly>
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <AdminEventEdit />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  </AuthProvider>
);

export default App;
