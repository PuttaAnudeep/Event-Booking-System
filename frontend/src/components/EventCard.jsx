import React from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Card, CardContent } from "./ui/card.jsx";
import { Badge } from "./ui/badge.jsx";
import { Button } from "./ui/button.jsx";

const EventCard = ({ event }) => {
  const isExpired = event.isExpired || dayjs(event.endTime).isBefore(dayjs());
  return (
    <Card className="overflow-hidden">
      <div className="h-44 w-full overflow-hidden">
        {event.imageUrl ? (
          <img className="h-full w-full object-cover" src={event.imageUrl} alt={event.title} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <CardContent className="space-y-2 pt-4">
        <div className="flex items-center gap-2">
          <Badge className="uppercase tracking-wide text-[11px]">{event.category}</Badge>
          <Badge variant="outline" className="uppercase tracking-wide text-[10px]">
            {event.eventType || "in-person"}
          </Badge>
          {isExpired && <Badge variant="destructive">Expired</Badge>}
        </div>
        <h3 className="text-lg font-semibold leading-tight">{event.title}</h3>
        <p className="muted">{event.location}</p>
        <p className="muted">{dayjs(event.startTime).format("MMM D, h:mm A")}</p>
        <div className="flex items-center justify-between pt-2">
          <strong className="text-xl">{event.isFree || event.price === 0 ? "Free" : `$${event.price.toFixed(2)}`}</strong>
          <Button asChild size="sm" disabled={isExpired}>
            <Link to={`/events/${event._id}`}>{isExpired ? "Ended" : "Book"}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
