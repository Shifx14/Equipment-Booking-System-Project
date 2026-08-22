# Equipment Booking and Approval System

A full-stack web application designed to manage equipment inventory, reservations, administrative approvals, physical check-out/check-in operations, and user support ticketing[cite: 1, 2].

## Tech Stack

*   **Frontend:** React (SPA), Vite, Tailwind CSS, React Router, Lucide Icons, Axios[cite: 1, 2].
*   **Backend:** FastAPI (Python 3.10+), Pydantic, SQLAlchemy ORM, Passlib (bcrypt), PyJWT[cite: 1, 2].
*   **Database:** SQLite[cite: 1, 2].

---

## Project Structure

```text
Equipment-Booking-System-Project/
├── backend/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── categories.py
│   │   ├── equipment.py
│   │   ├── bookings.py
│   │   ├── admin_operations.py
│   │   ├── support.py
│   │   └── users.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth_utils.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md