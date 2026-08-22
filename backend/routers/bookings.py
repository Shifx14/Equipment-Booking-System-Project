from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth_utils import get_current_user

router = APIRouter(tags=["bookings"])

@router.post("/api/bookings", response_model=schemas.BookingResponse)
def create_booking(
    booking: schemas.BookingCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    equipment = db.query(models.Equipment).filter(models.Equipment.id == booking.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    if equipment.available_qty < booking.quantity:
        raise HTTPException(status_code=400, detail="Requested quantity exceeds available stock")

    if booking.start_date >= booking.due_date:
        raise HTTPException(status_code=400, detail="Start date must be before due date")

    new_booking = models.Booking(
        user_id=current_user.id,
        equipment_id=booking.equipment_id,
        quantity=booking.quantity,
        start_date=booking.start_date,
        due_date=booking.due_date,
        status="pending"
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

@router.get("/api/bookings/requests", response_model=List[schemas.BookingResponse])
def get_user_requests(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id,
        models.Booking.status == "pending"
    ).all()

@router.delete("/api/bookings/requests/{booking_id}")
def cancel_booking_request(
    booking_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id, 
        models.Booking.user_id == current_user.id
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found")
    if booking.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be cancelled")
    
    db.delete(booking)
    db.commit()
    return {"message": "Booking request cancelled successfully"}

@router.get("/api/bookings/inventory", response_model=List[schemas.BookingResponse])
def get_user_inventory(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id,
        models.Booking.status.in_(["pending_issue", "issued", "returned"])
    ).all()