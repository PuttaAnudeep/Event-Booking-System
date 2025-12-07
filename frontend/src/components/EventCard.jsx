import React from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Card, CardContent } from "./ui/card.jsx";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";

const EventCard = ({ event }) => (
  <Card className="overflow-hidden">
    <div className="h-44 w-full overflow-hidden">
      <img
        className="h-full w-full object-cover"
        src={event.imageUrl || "https://picsum.photos/seed/event/600/400"}
        alt={event.title}
      />
    </div>
    <CardContent className="space-y-2 pt-4">
      <Badge className="uppercase tracking-wide text-[11px]">{event.category}</Badge>
      <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
      <p className="muted">{event.location}</p>
      <p className="muted">{dayjs(event.startTime).format("MMM D, h:mm A")}</p>
      <div className="flex items-center justify-between pt-2">
        <strong className="text-xl">${event.price.toFixed(2)}</strong>
        <Button asChild size="sm">
          <Link to={`/events/${event._id}`}>Book</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default EventCard;
