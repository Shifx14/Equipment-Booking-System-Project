from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, categories, equipment, bookings, admin_operations, support

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Equipment Booking and Approval System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(equipment.router)
app.include_router(bookings.router)
app.include_router(admin_operations.router)
app.include_router(support.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}