# 🍽️ Tallie Restaurant Reservation API

A robust REST API for managing restaurant table bookings, ensuring no double-bookings and valid operating hour constraints. Built with **Node.js**, **TypeScript**, and **SQLite**.

---

## 🚀 Getting Started

### Option 1: Using Docker (Recommended)

If you have Docker installed, you can start the entire environment with one command:

docker-compose up --build

The API will be accessible at `http://localhost:3000`.

### Option 2: Manual Installation

1. **Install dependencies:**
npm install

2. **Run in development mode:**
npm run dev

3. **Run tests:**
npm test

---

## 🛠 API Documentation

### 1. Restaurant & Table Management

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/restaurants` | Create a restaurant (name, open/close times) |
| `POST` | `/api/restaurants/:id/tables` | Add a table to a specific restaurant |
| `GET` | `/api/restaurants/:id/availability` | Get available time slots for a party size |

### 2. Reservation System

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/reservations` | Create a new reservation |
| `GET` | `/api/reservations/:restaurantId/:date` | View all reservations for a specific day |

---

## 🧠 Design Decisions & Assumptions

### 1. The "Double-Booking" Prevention

To ensure a table isn't booked twice at the same time, the API uses a specific SQL overlap check. A conflict exists if:

* `RequestedStartTime < ExistingReservationEndTime` **AND**
* `RequestedEndTime > ExistingReservationStartTime`

### 2. Time Management

* **Format:** All dates should be sent in ISO 8601 format (e.g., `2026-01-15T19:00:00Z`).
* **Operating Hours:** The system validates the `start_time` and `end_time` against the restaurant's `open_time` and `close_time` strings.

### 3. Database Choice

I used **SQLite** for this project because it is serverless and self-contained in a single file (`database.sqlite`). This makes it extremely easy for reviewers to run the project without setting up a heavy PostgreSQL or MySQL instance.

---

## 📈 Future Improvements & Scalability

If I had more time or were building this for a production environment at Tallie, I would:

1. **Implement Redis Caching:** I would cache table availability for the next 24 hours to reduce database load during high-traffic periods.
2. **Seating Optimization:** Currently, the system picks the first available table. I would add logic to suggest the "smallest possible" table that fits the party to maximize restaurant capacity.
3. **Websockets:** Add real-time updates for restaurant staff so they see new reservations instantly on their dashboard.
4. **PostgreSQL Migration:** For multiple restaurants with high concurrency, I would move to PostgreSQL to take advantage of row-level locking during the reservation transaction.

---

## 🧪 Testing Approach

The project includes **Integration Tests** using Jest and Supertest.

* **Validation Tests:** Ensures party sizes don't exceed table capacity.
* **Operating Hour Tests:** Rejects bookings made when the restaurant is closed.
* **Overlap Tests:** Confirms that the system correctly blocks a second booking on the same table at the same time.
