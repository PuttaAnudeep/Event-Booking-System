import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api";
import EventCard from "../components/EventCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Button } from "../components/ui/button.jsx";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get("/events").then(({ data }) => setEvents(data));
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const loadStats = async () => {
      const results = await Promise.all(
        events.map(async (ev) => {
          const { data } = await api.get(`/events/${ev._id}/availability`);
          return [ev._id, { capacity: ev.capacity, booked: data.booked || 0, remaining: data.remaining }];
        })
      );
      setStats(Object.fromEntries(results));
    };
    if (events.length) loadStats();
  }, [events, user]);

  const deleteEvent = async (id) => {
    await api.delete(`/events/${id}`);
    const { data } = await api.get("/events");
    setEvents(data);
  };

  if (user?.role === "admin") {
    return (
      <div className="page-shell">
        <div className="space-y-2">
          <h2 className="section-title">Events</h2>
          <p className="muted">Manage all events from one place.</p>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Booked</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev._id}>
                  <TableCell className="font-medium">{ev.title}</TableCell>
                  <TableCell className="muted">{dayjs(ev.startTime).format("MMM D, h:mm A")}</TableCell>
                  <TableCell>${ev.price.toFixed(2)}</TableCell>
                  <TableCell>{stats[ev._id]?.capacity ?? ev.capacity}</TableCell>
                  <TableCell>{stats[ev._id]?.booked ?? "-"}</TableCell>
                  <TableCell>{stats[ev._id]?.remaining ?? "-"}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/events/${ev._id}/edit`)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteEvent(ev._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="muted">
                    No events yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="space-y-2">
        <h2 className="section-title">Upcoming events</h2>
        <p className="muted">Browse and book concerts, conferences, and more.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
        {events.length === 0 && <p className="muted">No events yet.</p>}
      </div>
    </div>
  );
};

export default Home;
