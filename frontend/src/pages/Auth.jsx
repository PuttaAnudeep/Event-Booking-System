import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Select } from "../components/ui/select.jsx";

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
    <div className="page-shell max-w-lg">
      <Card className="p-1">
        <CardHeader>
          <CardTitle>{isLogin ? "Welcome back" : "Create account"}</CardTitle>
          <CardDescription>{isLogin ? "Login with your credentials" : "Sign up to start booking events"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                placeholder="you@example.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <Button className="w-full" type="submit">{isLogin ? "Login" : "Sign Up"}</Button>
            {error && <p className="muted">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
