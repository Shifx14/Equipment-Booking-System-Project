from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth_utils import get_current_user, get_admin_user

router = APIRouter(tags=["support"])

@router.get("/api/support/tickets", response_model=List[schemas.SupportTicketResponse])
def get_tickets(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role == "admin":
        return db.query(models.SupportTicket).all()
    return db.query(models.SupportTicket).filter(models.SupportTicket.user_id == current_user.id).all()

@router.post("/api/support/tickets", response_model=schemas.SupportTicketResponse)
def create_ticket(
    ticket_data: schemas.SupportTicketCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    new_ticket = models.SupportTicket(
        user_id=current_user.id,
        subject=ticket_data.subject,
        category=ticket_data.category,
        status="open"
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    initial_comment = models.TicketComment(
        ticket_id=new_ticket.id,
        sender_id=current_user.id,
        comment=ticket_data.initial_comment
    )
    db.add(initial_comment)
    db.commit()

    return new_ticket

@router.get("/api/support/tickets/{ticket_id}/comments", response_model=List[schemas.TicketCommentResponse])
def get_ticket_comments(
    ticket_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if current_user.role != "admin" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these comments")
        
    return db.query(models.TicketComment).filter(models.TicketComment.ticket_id == ticket_id).order_by(models.TicketComment.created_at.asc()).all()

@router.post("/api/support/tickets/{ticket_id}/comments", response_model=schemas.TicketCommentResponse)
def add_ticket_comment(
    ticket_id: int, 
    comment_data: schemas.TicketCommentCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if current_user.role != "admin" and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to comment on this ticket")

    new_comment = models.TicketComment(
        ticket_id=ticket_id,
        sender_id=current_user.id,
        comment=comment_data.comment
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@router.patch("/api/admin/support/tickets/{ticket_id}/status", response_model=schemas.SupportTicketResponse)
def update_ticket_status(
    ticket_id: int, 
    status_update: schemas.TicketStatusUpdate, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(get_admin_user)
):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    if status_update.status not in ["open", "in_review", "resolved"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    ticket.status = status_update.status
    db.commit()
    db.refresh(ticket)
    return ticket