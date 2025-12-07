import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import api from "../api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [adminStats, setAdminStats] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (user?.role === "admin") {
        const { data: events } = await api.get("/events");
        const stats = await Promise.all(
          events.map(async (ev) => {
            const { data: avail } = await api.get(`/events/${ev._id}/availability`);
            const booked = avail.booked || 0;
            const remaining = avail.remaining;
            return { ...ev, booked, remaining };
          })
        );
        setAdminStats(stats);
      } else {
        const { data } = await api.get("/bookings/me");
        setBookings(data);
      }
    };
    load();
  }, [user]);

  return (
    <div className="page-shell">
      <Card>
        <CardHeader>
          <CardTitle>{user?.role === "admin" ? "Event occupancy" : "My bookings"}</CardTitle>
        </CardHeader>
        <CardContent>
          {user?.role === "admin" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead>Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminStats.map((ev) => (
                  <TableRow key={ev._id}>
                    <TableCell className="font-medium">{ev.title}</TableCell>
                    <TableCell className="muted">{dayjs(ev.startTime).format("MMM D, h:mm A")}</TableCell>
                    <TableCell>{ev.capacity}</TableCell>
                    <TableCell>{ev.booked}</TableCell>
                    <TableCell>{ev.remaining}</TableCell>
                  </TableRow>
                ))}
                {adminStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="muted">
                      No events yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="font-medium">{b.event?.title}</TableCell>
                    <TableCell className="muted">{dayjs(b.event?.startTime).format("MMM D, h:mm A")}</TableCell>
                    <TableCell>{b.quantity}</TableCell>
                    <TableCell>${b.totalPrice.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{b.status}</TableCell>
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="muted">
                      No bookings yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Bookings;
