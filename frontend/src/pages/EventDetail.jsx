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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: eventData }, { data: availabilityData }] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/events/${id}/availability`),
        ]);
        setEvent(eventData);
        setAvailability(availabilityData);
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load event");
      }
    };
    load();
  }, [id]);

  const isExpired = event && (event.isExpired || dayjs(event.endTime).isBefore(dayjs()));
  const hasStarted = event && !dayjs(event.startTime).isAfter(dayjs());

  const submitBooking = async () => {
    if (!user) return navigate("/login");
    if (user.role === "admin") {
      setMessage("Admins cannot book events.");
      return;
    }
    if (isExpired || hasStarted) {
      setMessage(isExpired ? "This event has ended." : "This event has already started; bookings are closed.");
      return;
    }
    setMessage("");
    setLoading(true);
    try {
      if (event?.isFree || event?.price === 0) {
        await api.post("/bookings", { eventId: id, quantity, paymentProvider: "free" });
        setMessage("Booking confirmed!");
        navigate("/bookings");
      } else {
        const { data } = await api.post("/payments/stripe/checkout", { eventId: id, quantity });
        if (data?.url) {
          window.location.href = data.url;
        } else {
          setMessage("Unable to start checkout.");
        }
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error starting payment");
    } finally {
      setLoading(false);
    }
  };

  if (message && !event) return <p className="text-destructive page-shell">{message}</p>;
  if (!event) return <p className="muted">Loading...</p>;

  return (
    <div className="page-shell max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-border">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-[320px] sm:h-[380px] md:h-[460px] object-cover"
          />
        ) : (
          <div className="flex h-80 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            No image provided
          </div>
        )}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="uppercase tracking-wide text-[11px]">{event.category}</Badge>
            <Badge variant="outline" className="uppercase tracking-wide text-[10px]">{event.eventType || "in-person"}</Badge>
          </div>
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
                <div className="text-2xl font-semibold">{event.isFree || event.price === 0 ? "Free" : `$${event.price.toFixed(2)}`}</div>
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
            <Button className="w-full" onClick={submitBooking} disabled={user?.role === "admin" || loading || isExpired || hasStarted}>
              {isExpired || hasStarted
                ? hasStarted && !isExpired
                  ? "Event started"
                  : "Event ended"
                : user?.role === "admin"
                  ? "Admins cannot book"
                  : loading
                    ? "Redirecting..."
                    : "Book Now"}
            </Button>
            {message && <p className="muted">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetail;
