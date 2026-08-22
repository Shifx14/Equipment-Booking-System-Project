Installation for Windows 10/11

Prerequisites
    Python (3.10+): Download from python.org (Ensure "Add python.exe to PATH" is checked during installation).
    Node.js (LTS): Download from nodejs.org.

Backend Setup (FastAPI)
Open terminal window and navigate to the backend directory:

    cd backend
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    pip install email-validator
    uvicorn main:app --reload

The backend server will run at http://localhost:8000
Interactive API documentation is available at http://localhost:8000/docs

Frontend Setup (React)
Open terminal window and navigate to the frontend directory:

    cd frontend
    npm install
    npm install react-router-dom axios lucide-react
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    npm run dev
  
First-Time Admin Account Creation
Go to http://localhost:8000/docs, use the POST /api/auth/register endpoint to create a user account (keep passwords under 72 characters due to bcrypt limitations).
Open terminal and activate backend virtual environment and open python shell:

    from database import SessionLocal
    from models import User
    db = SessionLocal()
    user = db.query(User).first()
    user.role = "admin"
    db.commit()
    exit()

Log into http://localhost:5173/login with those credentials to access the Admin Panel.


