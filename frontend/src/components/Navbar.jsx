import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "./ui/button.jsx";
import { Separator } from "./ui/separator.jsx";
import { Home, CalendarClock, User, LogIn, LogOut, PlusCircle } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="glass sticky top-4 z-30 mb-6 flex items-center justify-between px-4 py-3">
      <Link to="/" className="text-lg font-bold tracking-tight">Eventia</Link>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Explore
          </Link>
        </Button>
        {user && user.role !== "admin" && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/bookings">
              <CalendarClock className="mr-2 h-4 w-4" /> My Bookings
            </Link>
          </Button>
        )}
        {user && (
          <Button asChild variant="ghost" size="sm">
            <Link to="/profile">
              <User className="mr-2 h-4 w-4" /> Profile
            </Link>
          </Button>
        )}
        {user?.role === "admin" && (
          <Button asChild size="sm">
            <Link to="/admin/events#create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        )}
        <Separator orientation="vertical" className="mx-1 h-6" />
        {!user && (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/register">
                <PlusCircle className="mr-2 h-4 w-4" /> Sign Up
              </Link>
            </Button>
          </>
        )}
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{user.role}</span>
            <Button size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
