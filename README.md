# Event Booking System (MERN)

MERN-based event booking platform inspired by Eventbrite/Ticketmaster. Users can browse and book events, admins manage inventory and pricing, and payments are wired for Stripe with a PayPal placeholder. Includes JWT auth, availability checks, booking reminders (mock email), and responsive React UI.

## Stack
- Backend: Node.js, Express, MongoDB (Mongoose), Stripe SDK (create payment intent), JWT auth
- Frontend: React (Vite), React Router, Axios, Day.js

## Quick start
### Prereqs
- Node.js 18+
- MongoDB running locally (or connection string)

### Backend
```bash
cd backend
cp .env.example .env   # set MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, CLIENT_URL
npm install
npm run seed            # seeds admin + sample events
npm run dev             # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env   # set VITE_API_URL if backend URL differs
npm install
npm run dev             # opens http://localhost:5173
```

Default admin (from seed):
- email: `admin@example.com`
- password: `password123`

## Features
- Browse published events with availability check per event
- JWT auth (register/login/me) with roles (`user`, `admin`)
- Bookings with capacity validation and mock email reminder
- Admin CRUD for events (create/update/delete, pricing, capacity)
- Stripe payment intent endpoint + PayPal placeholder
- Responsive UI with calendars/times via Day.js

## API overview (prefix: `/api`)
- `GET /health` – health check
- `POST /auth/register` – register user
- `POST /auth/login` – login
- `GET /auth/me` – current user
- `GET /events` – list published events
- `GET /events/:id` – event detail
- `GET /events/:id/availability` – seats remaining
- `POST /events` – create event (admin)
- `PUT /events/:id` – update event (admin)
- `DELETE /events/:id` – delete event (admin)
- `POST /bookings` – create booking (checks remaining seats)
- `GET /bookings/me` – user bookings
- `GET /bookings` – all bookings (admin)
- `PATCH /bookings/:id/cancel` – cancel booking
- `POST /payments/create-intent` – Stripe intent (requires `STRIPE_SECRET_KEY`)
- `POST /payments/paypal/placeholder` – mock endpoint

## Project structure
```
backend/
	src/
		config/db.js
		index.js
		models/{User,Event,Booking}.js
		routes/{auth,events,bookings,payments}.js
		middleware/auth.js
		utils/sendEmail.js
		seed.js
frontend/
	src/
		App.jsx, main.jsx, styles.css
		api.js
		context/AuthContext.jsx
		components/{Navbar,ProtectedRoute,EventCard}.jsx
		pages/{Home,EventDetail,Auth,Bookings,AdminEvents}.jsx
```

## Payments
- Stripe intent: configure `STRIPE_SECRET_KEY` and call `POST /payments/create-intent` with `{ eventId, quantity }` to receive `clientSecret` for the frontend Stripe Elements flow.
- PayPal: placeholder endpoint returns a mock approval URL; swap with real SDK integration as needed.

## Notes
- Email sending is mocked (logs to console). Replace `sendEmail.js` with a provider (SendGrid/SES/etc.).
- Availability uses current confirmed bookings excluding cancellations.
- Use HTTPS and secure cookie settings in production; add rate limiting before going live.