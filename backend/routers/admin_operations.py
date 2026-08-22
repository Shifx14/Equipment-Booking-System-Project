from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
import models
import schemas
from auth_utils import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin_operations"])

@router.get("/bookings", response_model=List[schemas.BookingResponse])
def get_all_bookings(db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    return db.query(models.Booking).all()

@router.patch("/bookings/{booking_id}/decision", response_model=schemas.BookingResponse)
def booking_decision(
    booking_id: int, 
    decision: schemas.BookingDecision, 
    db: Session = Depends(get_db), 
    admin=Depends(get_admin_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if decision.status == "approved":
        booking.status = "pending_issue"
        equipment = db.query(models.Equipment).filter(models.Equipment.id == booking.equipment_id).first()
        if equipment and equipment.available_qty >= booking.quantity:
            equipment.available_qty -= booking.quantity
        else:
            raise HTTPException(status_code=400, detail="Insufficient equipment stock")
    elif decision.status == "rejected":
        booking.status = "rejected"
        booking.admin_notes = decision.admin_notes
    else:
        raise HTTPException(status_code=400, detail="Invalid decision status")

    db.commit()
    db.refresh(booking)
    return booking

@router.patch("/rentals/{booking_id}/issue", response_model=schemas.BookingResponse)
def issue_rental(booking_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != "pending_issue":
        raise HTTPException(status_code=400, detail="Booking is not in pending_issue state")
        
    booking.status = "issued"
    db.commit()
    db.refresh(booking)
    return booking

@router.patch("/rentals/{booking_id}/return", response_model=schemas.BookingResponse)
def return_rental(
    booking_id: int, 
    return_data: schemas.RentalReturn, 
    db: Session = Depends(get_db), 
    admin=Depends(get_admin_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking.status != "issued":
        raise HTTPException(status_code=400, detail="Booking is not currently issued")
        
    booking.status = "returned"
    booking.returned_at = datetime.utcnow()
    booking.is_late = return_data.is_late
    booking.is_damaged = return_data.is_damaged
    
    if return_data.admin_notes:
        booking.admin_notes = return_data.admin_notes
        
    equipment = db.query(models.Equipment).filter(models.Equipment.id == booking.equipment_id).first()
    if equipment:
        equipment.available_qty += booking.quantity
        if return_data.is_damaged:
            equipment.status = "damaged"

    db.commit()
    db.refresh(booking)
    return booking