import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "./ui/button.jsx";
import { Separator } from "./ui/separator.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="glass sticky top-4 z-30 mb-6 flex items-center justify-between px-4 py-3">
      <Link to="/" className="text-lg font-bold tracking-tight">Eventia</Link>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">Explore</Link>
        </Button>
        {user?.role !== "admin" && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/bookings">My Bookings</Link>
          </Button>
        )}
        {user && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/profile">Profile</Link>
          </Button>
        )}
        {user?.role === "admin" && (
          <Button asChild size="sm">
            <Link to="/admin/events#create">Create Event</Link>
          </Button>
        )}
        <Separator orientation="vertical" className="mx-1 h-6" />
        {!user && (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">Sign Up</Link>
            </Button>
          </>
        )}
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{user.role}</span>
            <Button size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
