import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";

const PaymentSuccess = () => {
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Confirming your payment...");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing checkout session id.");
      return;
    }

    const confirm = async () => {
      try {
        await api.get("/payments/stripe/confirm", { params: { session_id: sessionId } });
        setStatus("success");
        setMessage("Payment confirmed! Your booking is ready.");
      } catch (err) {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Unable to confirm payment.");
      }
    };

    confirm();
  }, []);

  return (
    <div className="page-shell">
      <Card>
        <CardHeader>
          <CardTitle>Payment status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={status === "error" ? "text-destructive" : "muted"}>{message}</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/bookings")}>Go to bookings</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Back home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
