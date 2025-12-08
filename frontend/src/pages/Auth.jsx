import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Select } from "../components/ui/select.jsx";

import heroImage from "../assets/event-booking-backimg.png";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const isLogin = location.pathname === "/login";

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin ? { email: form.email, password: form.password } : form;

      const { data } = await api.post(endpoint, payload);
      login(data.token, data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6">
      <Card className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.15)] bg-white">
        <div className="grid md:grid-cols-2">
          
          {/* LEFT — FORM SECTION */}
          <div className="p-10 flex flex-col justify-center space-y-8 bg-gradient-to-b from-white to-yellow-50/40">
            <div>
              <h1 className="text-xl font-semibold mb-1 text-gray-800 tracking-wide">Eventia</h1>
              <CardTitle className="text-3xl font-semibold">
                {isLogin ? "Welcome back" : "Create an account"}
              </CardTitle>

              <CardDescription className="text-gray-600">
                {isLogin
                  ? "Sign in to manage and book your favorite events."
                  : "Join Eventia today and start exploring amazing events around you!"}
              </CardDescription>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <Label>Full name</Label>
                    <Input
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  placeholder="you@example.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Password</Label>
                <Input
                  placeholder="••••••••"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <Button className="w-full bg-[#C97A4B] hover:bg-[#b86b43] text-white font-medium shadow-md">

                {isLogin ? "Sign in" : "Create account"}
              </Button>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>

            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="text-black font-medium underline"
                onClick={() => navigate(isLogin ? "/register" : "/login")}
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>

          {/* RIGHT — HERO IMAGE SECTION */}
          <div className="relative bg-yellow-100">
            <img
              src={heroImage}
              alt="Event"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/40" />

            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center text-white space-y-2 px-6 w-full max-w-md">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Discover</p>

              <h3 className="text-2xl font-semibold leading-tight">
                Join experiences people love
              </h3>

              <p className="text-sm text-white/80">
                Book concerts, workshops, meetups, and more — all from one seamless app.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
