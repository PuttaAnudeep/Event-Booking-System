import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => setEvent(data));
    api.get(`/events/${id}/availability`).then(({ data }) => setAvailability(data));
  }, [id]);

  const submitBooking = async () => {
    if (!user) return navigate("/login");
    if (user.role === "admin") {
      setMessage("Admins cannot book events.");
      return;
    }
    setMessage("");
    try {
      await api.post("/bookings", { eventId: id, quantity });
      setMessage("Booking confirmed! Check your email.");
      navigate("/bookings");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error booking");
    }
  };

  if (!event) return <p className="muted">Loading...</p>;

  return (
    <div className="page-shell max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-border">
        <img
          src={event.imageUrl || "https://picsum.photos/seed/event/1200/500"}
          alt={event.title}
          className="h-80 w-full object-cover"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          <Badge className="uppercase tracking-wide text-[11px]">{event.category}</Badge>
          <h2 className="text-3xl font-semibold leading-tight">{event.title}</h2>
          <p className="muted">{event.location}</p>
          <p className="muted">{dayjs(event.startTime).format("MMM D, h:mm A")} - {dayjs(event.endTime).format("MMM D, h:mm A")}</p>
          <p className="text-base text-foreground/90 pt-2">{event.description}</p>
        </div>
        <Card className="p-5">
          <CardContent className="space-y-4 p-0">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="muted">Ticket price</p>
                <div className="text-2xl font-semibold">${event.price.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <p className="muted">Availability</p>
                <div className="text-lg font-medium">{availability ? availability.remaining : "-"} seats left</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="muted">Quantity</p>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
              />
            </div>
            <Button className="w-full" onClick={submitBooking} disabled={user?.role === "admin"}>
              {user?.role === "admin" ? "Admins cannot book" : "Book Now"}
            </Button>
            {message && <p className="muted">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetail;
