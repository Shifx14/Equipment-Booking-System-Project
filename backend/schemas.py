from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

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