import React, { useEffect, useMemo, useState } from "react";
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
  date: "",
  startClock: "",
  endClock: "",
};

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/events/manage");
        setEvents(data);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load events");
      }
    };
    load();
  }, []);

  const startEdit = (eventId) => {
    const ev = events.find((e) => e._id === eventId);
    if (!ev) return;
    setEditingId(ev._id);
    setEditForm({
      ...ev,
      startTime: dayjs(ev.startTime).format("YYYY-MM-DDTHH:mm"),
      endTime: dayjs(ev.endTime).format("YYYY-MM-DDTHH:mm"),
      imageUrl: ev.imageUrl,
    });
  };

  const payloadFromForm = useMemo(() => {
    if (!form.date || !form.startClock || !form.endClock) return null;
    const start = dayjs(`${form.date}T${form.startClock}`).toISOString();
    const end = dayjs(`${form.date}T${form.endClock}`).toISOString();
    return { startTime: start, endTime: end };
  }, [form.date, form.startClock, form.endClock]);

  const submit = async (e) => {
    e.preventDefault();
    if (!payloadFromForm) return;
    const body = {
      title: form.title,
      description: form.description,
      location: form.location,
      category: form.category,
      eventType: form.eventType,
      capacity: Number(form.capacity),
      price: form.isFree ? 0 : Number(form.price),
      isFree: !!form.isFree,
      imageUrl: form.imageUrl,
      ...payloadFromForm,
    };
    try {
      await api.post("/events", body);
      setMessage("Event published");
      setForm(emptyForm);
      const { data } = await api.get("/events/manage");
      setEvents(data);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to publish event");
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      await api.put(`/events/${editingId}`, {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        category: editForm.category,
        eventType: editForm.eventType,
        capacity: Number(editForm.capacity),
        price: editForm.isFree ? 0 : Number(editForm.price),
        isFree: !!editForm.isFree,
        imageUrl: editForm.imageUrl,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
      });
      setMessage("Event updated");
      setEditingId(null);
      setEditForm(emptyForm);
      const { data } = await api.get("/events/manage");
      setEvents(data);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to update event");
    }
  };

  const handleImageUpload = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter((prev) => ({ ...prev, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="page-shell">
      <Card>
        <CardHeader>
          <CardTitle>Create event</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit} id="create">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start time</Label>
                  <Input type="time" value={form.startClock} onChange={(e) => setForm({ ...form, startClock: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>End time</Label>
                  <Input type="time" value={form.endClock} onChange={(e) => setForm({ ...form, endClock: e.target.value })} required />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-2">
                <Label>Category</Label>
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
              </div>
              <div className="space-y-2">
                <Label>Event type</Label>
                <Select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })}>
                  <option value="in-person">In-person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="other">Other</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  disabled={form.isFree}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isFree"
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked, price: e.target.checked ? 0 : form.price })}
              />
              <Label htmlFor="isFree">This is a free event</Label>
            </div>
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0], setForm)} />
              {form.imageUrl && <img src={form.imageUrl} alt="preview" className="h-24 w-full rounded-md object-cover border border-border" />}
            </div>
            <Button type="submit" disabled={!payloadFromForm}>Publish Event</Button>
            {message && <p className="muted">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEvents;
