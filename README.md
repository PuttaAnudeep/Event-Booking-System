# Eventia-[Event-Booking-System]

Eventia is a simple place to find, book, and manage events. Attendees discover concerts, conferences, and meetups. Admin create events, track seats, and collect payments. Everything runs on a clean, responsive web app.

## Project setup to run locally.

1) Install the basics
- Install Node.js 18 before running this application

2) Start the backend (API)
- Open a terminal and run:
```bash
cd backend
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, STRIPE_SECRET_KEY, CLIENT_URL
npm install
npm run seed    # creates an admin and sample events (if mongodb uri changes)
npm run dev             # starts the API at http://localhost:5000
```

3) Start the frontend (web app)
- In another terminal:
```bash
cd frontend
cp .env.example .env   # set VITE_API_URL if your API URL is different
npm install
npm run dev             # opens the app at http://localhost:5173
```

4) Log in and try it
- Default admin from the seed:
 email `a@gmail.com`, password `Password@123`.
- Create a normal account(with original email id to recieve mail) from the Sign Up form to book as an attendee.

5) To explore the complete payment experience—including payment processing, notifications, and reminders—use the Stripe test credit card details below
- Email:test@example.com
- **Card details:**
  card no : 4242 4242 4242 4242
  expires : 12/34
  cvv : 567
  name on card : Zhang San
  Country : United States
  pin :  12345

**Note:** The backend `.env` file and frontend `.env` file are given using drive links

**backend .env file** : https://drive.google.com/file/d/1faRSo8qjemcX8RbTcG4ZM7qeblGVkJNs/view?usp=sharing

**frontend .env file** : https://drive.google.com/file/d/1GD6c7c6ntMNrKb91yocHt5OHZ5Av0SZc/view?usp=sharing

## Features 

### Explore and filter
- Browse upcoming events with search, category filters, and pagination.
- See live availability; bookings close automatically when seats run out or the event has started/ended.

### Booking and payments
- Book free events instantly; Stripe checkout for paid tickets (PayPal placeholder available).
- Track your bookings with clear statuses; cancel when allowed.

### Reminders and reliability
- Automatic email reminders before events; capacity and availability stay in sync.
- Blocking rules stop bookings after start/end times.

### Host and admin tools
- Create, edit, delete events; set price, capacity, free/paid; choose in-person/online/hybrid; upload images.
- Admin manage view with availability stats and pagination (10 per page) for quick oversight.

## How it works 
- Accounts: Sign up or log in; admins unlock a Manage Events dashboard.
- Booking: Pick an event, choose tickets, confirm. The system blocks bookings once seats are gone or the start time passes.
- Payments: Stripe for paid tickets; free events skip payment entirely.
- Reminders: Automatic emails go out before the event with the essentials.

## Technology:
- Backend: Node.js, Express, MongoDB, JWT auth, Stripe payments, scheduled reminders.
- Frontend: React (Vite), React Router, Axios, shadcn UI.

## Application demo video
- Watch the walkthrough: [Eventia demo](frontend/src/Assets/Demo%20App%20video/eventia-app%20video.mp4)
-or else use Drive link (shareable): https://drive.google.com/file/d/17eG8bzQzgDVRJFrgTTxoch9YMqkqy31G/view?usp=sharing

## Application WorkFlow:
Images live in `frontend/src/Assets/App Screenshots/` (names kept in order below).

1. Home page – Landing page with hero, highlights, and quick entry to explore events.
	![Home page](frontend/src/Assets/App%20Screenshots/1.home%20page.png)

2. Explore events with filters – Search, category filters, and pagination to find events fast.  
	![Explore events through filters](frontend/src/Assets/App%20Screenshots/2.Explore%20Events%20through%20filters.png)

3. Sign up page – Create an account (admins manage events; users book them). 
	![Sign up page](frontend/src/Assets/App%20Screenshots/3.signup%20page.png)

4. Login page – Return users sign in to continue booking or managing events.
	![Login page](frontend/src/Assets/App%20Screenshots/4.login%20page.png)

5. Admin creating event – Add title, description, location, time, category, type, price/free, capacity, and image.
	![Admin creating event](frontend/src/Assets/App%20Screenshots/5.admin%20creating%20event.png)

6. Admin manage events – Table view with availability stats, edit/delete, and pagination (10 per page).
	![Admin manage events](frontend/src/Assets/App%20Screenshots/6.admin%20manage%20events.png)

7. Admin event edit page – Update event details, timing, pricing, capacity, and banner.
	![Admin event edit page](frontend/src/Assets/App%20Screenshots/7.admin%20event%20edit%20page.png)

8. Admin profile page – View/update admin profile info.
	![Admin profile page](frontend/src/Assets/App%20Screenshots/8.Admin%20profile%20page.png)

9. User accessing events after login – Authenticated view of events with booking actions.
	![User accessing events after login](frontend/src/Assets/App%20Screenshots/9.User%20accessing%20events%20after%20login.png)

10. Pagination – Navigate event lists page by page.
	![Pagination](frontend/src/Assets/App%20Screenshots/10.pagination.png)

11. User booking page – Event detail, availability, quantity selector, and booking CTA.
	![User booking page](frontend/src/Assets/App%20Screenshots/11.user%20booking%20page.png)

12. Stripe payment gateway – Secure checkout for paid tickets.
	![Stripe payment gateway](frontend/src/Assets/App%20Screenshots/12.stripe%20payment%20gateway.png)

13. Payment success page – Confirmation after successful payment.
	![Payment success page](frontend/src/Assets/App%20Screenshots/13.payment%20sucess%20page.png)

14. User booked events – List of a user’s confirmed bookings.
	![User booked events](frontend/src/Assets/App%20Screenshots/14.user%20booked%20events.png)

15. Booking confirmation mail – Email sent immediately after booking.
	![Booking confirmation mail](frontend/src/Assets/App%20Screenshots/15.booking%20confirmation%20mail.png)

16. Event reminder page – Reminder email before the event with details.
	![Event reminder page](frontend/src/Assets/App%20Screenshots/16.Event%20remainder%20page.png)

17. User profile page – View and update personal details; change password.
	![User profile page](frontend/src/Assets/App%20Screenshots/17.user%20profile%20page.png)

