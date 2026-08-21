from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    username: str
    email: EmailStr
    role: str
    is_banned: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    name: str
    username: str
    email: EmailStr

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class AdminPasswordReset(BaseModel):
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class EquipmentCreate(BaseModel):
    name: str
    category_id: int
    price: int
    photo_url: Optional[str] = None
    total_qty: int
    available_qty: int
    status: str = "in_stock"

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[int] = None
    photo_url: Optional[str] = None
    total_qty: Optional[int] = None
    available_qty: Optional[int] = None
    status: Optional[str] = None

class EquipmentResponse(BaseModel):
    id: int
    name: str
    category_id: int
    price: int
    photo_url: Optional[str] = None
    total_qty: int
    available_qty: int
    status: str
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

class BookingCreate(BaseModel):
    equipment_id: int
    quantity: int
    start_date: datetime
    due_date: datetime

class BookingResponse(BaseModel):
    id: int
    user_id: int
    equipment_id: int
    quantity: int
    start_date: datetime
    due_date: datetime
    returned_at: Optional[datetime] = None
    status: str
    is_late: bool
    is_damaged: bool
    admin_notes: Optional[str] = None
    created_at: datetime
    equipment: Optional[EquipmentResponse] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class BookingDecision(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class RentalReturn(BaseModel):
    is_late: bool = False
    is_damaged: bool = False
    admin_notes: Optional[str] = None

class TicketCommentCreate(BaseModel):
    comment: str

class TicketCommentResponse(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    comment: str
    created_at: datetime
    sender: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class SupportTicketCreate(BaseModel):
    subject: str
    category: str
    initial_comment: str

class SupportTicketResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    category: str
    status: str
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class TicketStatusUpdate(BaseModel):
    status: str