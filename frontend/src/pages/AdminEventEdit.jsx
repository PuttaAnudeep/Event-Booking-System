import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Button } from "../components/ui/button.jsx";
import { Label } from "../components/ui/label.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { Select } from "../components/ui/select.jsx";

const emptyForm = {
  title: "",
  description: "",
  location: "",
  category: "concert",
  eventType: "in-person",
  capacity: 100,
  price: 50,
  isFree: false,
  imageUrl: "",
  startTime: "",
  endTime: "",
};

const AdminEventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setForm({
          ...data,
          startTime: dayjs(data.startTime).format("YYYY-MM-DDTHH:mm"),
          endTime: dayjs(data.endTime).format("YYYY-MM-DDTHH:mm"),
        });
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load event");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/events/${id}`, {
        title: form.title,
        description: form.description,
        location: form.location,
        category: form.category,
        eventType: form.eventType,
        capacity: Number(form.capacity),
        price: form.isFree ? 0 : Number(form.price),
        isFree: !!form.isFree,
        imageUrl: form.imageUrl,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setMessage("Event updated");
      navigate("/");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to update event");
    }
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="page-shell">
        <p className="muted">Loading event...</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Card>
        <CardHeader>
          <CardTitle>Edit event</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
              <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="concert">Concert</option>
                <option value="conference">Conference</option>
                <option value="sports">Sports</option>
                <option value="workshop">Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="meetup">Meetup</option>
                <option value="festival">Festival</option>
                <option value="other">Other</option>
              </Select>
              <Select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                <option value="in-person">In-person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
                <option value="other">Other</option>
              </Select>
              <Input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              <Input
                type="number"
                placeholder="Price"
                value={form.price}
                disabled={form.isFree}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isFreeEdit"
                type="checkbox"
                checked={!!form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked, price: e.target.checked ? 0 : form.price })}
              />
              <Label htmlFor="isFreeEdit">This is a free event</Label>
            </div>
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0])} />
              {form.imageUrl && <img src={form.imageUrl} alt="preview" className="h-full w-full rounded-md object-cover border border-border" />}
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save changes</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
            {message && <p className="muted">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventEdit;
