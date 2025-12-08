import React, { useEffect, useState } from "react";
import api from "../api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Button } from "../components/ui/button.jsx";
import { Label } from "../components/ui/label.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Profile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/auth/me");
      setForm({ name: data.user.name, email: data.user.email, password: "" });
      setLoading(false);
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await api.put("/auth/me", payload);
      login(localStorage.getItem("token"), data.user);
      if (form.password) {
        setMessage("Password updated. Use your new password next time you log in.");
      } else {
        setMessage("Profile updated");
      }
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      const validationMessage = err.response?.data?.errors?.[0]?.msg;
      setMessage(apiMessage || validationMessage || "Update failed");
    }
  };

  if (loading) return <div className="page-shell">Loading...</div>;

  return (
    <div className="page-shell max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View and edit your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-muted-foreground">Role: <span className="uppercase">{user?.role}</span></div>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>New Password (optional)</Label>
              <Input
                type="password"
                placeholder="Leave blank to keep current"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button type="submit">Save changes</Button>
            {message && <p className="muted">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
