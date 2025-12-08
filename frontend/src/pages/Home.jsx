import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "../api";
import EventCard from "../components/EventCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select } from "../components/ui/select.jsx";
import { Pencil, Trash2 } from "lucide-react";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const pageSize = 6;
  const adminPageSize = 5;
  const navigate = useNavigate();
  const { user } = useAuth();

  const pagesToShow = Array.from(
    new Set([1, totalPages, page, page - 1, page + 1, page - 2, page + 2].filter((p) => p >= 1 && p <= totalPages))
  ).sort((a, b) => a - b);

  useEffect(() => {
    setPage(1);
  }, [user]);

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  useEffect(() => {
    const load = async () => {
      try {
        const path = user?.role === "admin" ? "/events/manage" : "/events";
        const params = user?.role === "admin" ? undefined : { params: { page, limit: pageSize, category, search } };
        const { data } = await api.get(path, params);
        if (user?.role === "admin") {
          const pages = Math.max(Math.ceil((data?.length || 0) / adminPageSize), 1);
          if (page > pages) {
            setPage(pages);
          }
          setEvents(data);
          setTotalPages(pages);
        } else {
          setEvents(data.events || []);
          setTotalPages(Math.max(data.totalPages || 1, 1));
        }
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load events");
      }
    };
    load();
  }, [user, page, category, search]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const loadStats = async () => {
      try {
        const results = await Promise.all(
          events.map(async (ev) => {
            const { data } = await api.get(`/events/${ev._id}/availability`);
            return [ev._id, { capacity: ev.capacity, booked: data.booked || 0, remaining: data.remaining }];
          })
        );
        setStats(Object.fromEntries(results));
      } catch (err) {
        setMessage(err?.response?.data?.message || "Unable to load event stats");
      }
    };
    if (events.length) loadStats();
  }, [events, user]);

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      const { data } = await api.get("/events/manage");
      const pages = Math.max(Math.ceil((data?.length || 0) / adminPageSize), 1);
      if (page > pages) {
        setPage(pages);
      }
      setEvents(data);
      setTotalPages(pages);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Unable to delete event");
    }
  };

  if (user?.role === "admin") {
    const adminEvents = events.slice((page - 1) * adminPageSize, page * adminPageSize);

    return (
      <div className="page-shell">
        <div className="space-y-2">
          <h2 className="section-title">Events</h2>
          <p className="muted">Manage all events from one place.</p>
          {message && <p className="text-destructive text-sm">{message}</p>}
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Booked</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminEvents.map((ev) => (
                <TableRow key={ev._id}>
                  <TableCell className="font-medium">{ev.title}</TableCell>
                  <TableCell className="muted">{dayjs(ev.startTime).format("MMM D, h:mm A")}</TableCell>
                  <TableCell className="capitalize">{ev.eventType || "in-person"}</TableCell>
                  <TableCell>{ev.isFree || ev.price === 0 ? "Free" : `$${ev.price.toFixed(2)}`}</TableCell>
                  <TableCell className="capitalize">{ev.isExpired || dayjs(ev.endTime).isBefore(dayjs()) ? "expired" : "active"}</TableCell>
                  <TableCell>{stats[ev._id]?.capacity ?? ev.capacity}</TableCell>
                  <TableCell>{stats[ev._id]?.booked ?? "-"}</TableCell>
                  <TableCell>{stats[ev._id]?.remaining ?? "-"}</TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/events/${ev._id}/edit`)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteEvent(ev._id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {adminEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="muted">
                    No events yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              {pagesToShow.map((p, idx) => {
                const prev = pagesToShow[idx - 1];
                const needDots = idx > 0 && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {needDots && <span className="text-xs text-muted-foreground">...</span>}
                    <Button variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
                      {p}
                    </Button>
                  </React.Fragment>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="space-y-2">
        <h2 className="section-title">Upcoming events</h2>
        <p className="muted">Browse and book concerts, conferences, and more.</p>
        {message && <p className="text-destructive text-sm">{message}</p>}
      </div>
      <div className="mt-4 rounded-2xl border border-border bg-gradient-to-r from-amber-50 via-white to-sky-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Eventia</p>
        <div className="mt-2 space-y-2 sm:flex sm:items-start sm:justify-between">
          <div className="sm:max-w-xl">
            <h3 className="text-xl font-semibold text-foreground">All-in-one booking for hosts and attendees.</h3>
            <p className="muted">
              Eventia keeps everything organized: discover verified events, reserve seats instantly, pay securely for paid
              events, and get calendar-ready reminders so you never miss a moment.
            </p>
          </div>
          <div className="mt-3 grid w-full max-w-md grid-cols-1 gap-2 sm:mt-0 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-white/80 p-3 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Curated categories</p>
              <p className="text-xs text-muted-foreground">Concerts, conferences, sports, workshops, webinars, meetups, and more.</p>
            </div>
            <div className="rounded-lg border border-border bg-white/80 p-3 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Frictionless booking</p>
              <p className="text-xs text-muted-foreground">Secure payments for paid tickets and instant confirmation for free events.</p>
            </div>
            <div className="rounded-lg border border-border bg-white/80 p-3 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Smart reminders</p>
              <p className="text-xs text-muted-foreground">Email nudges before events start plus live capacity tracking.</p>
            </div>
            <div className="rounded-lg border border-border bg-white/80 p-3 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Built for hosts</p>
              <p className="text-xs text-muted-foreground">Create, manage, and monitor attendance with real-time availability.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-white/70 p-3 shadow-sm">
        <div className="flex-1 min-w-[180px]">
          <Input
            placeholder="Search by title, description, location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
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
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
        {events.length === 0 && <p className="muted">No events yet.</p>}
      </div>
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {pagesToShow.map((p, idx) => {
              const prev = pagesToShow[idx - 1];
              const needDots = idx > 0 && p - prev > 1;
              return (
                <React.Fragment key={p}>
                  {needDots && <span className="text-xs text-muted-foreground">...</span>}
                  <Button variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                </React.Fragment>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
