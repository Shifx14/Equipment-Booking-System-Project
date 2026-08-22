from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
from auth_utils import get_current_user, get_admin_user, get_password_hash, verify_password

router = APIRouter(tags=["users"])

@router.get("/api/users/me", response_model=schemas.UserResponse)
def get_my_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/api/users/me", response_model=schemas.UserResponse)
def update_my_profile(
    profile_data: schemas.UserProfileUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    existing = db.query(models.User).filter(
        (models.User.username == profile_data.username) | (models.User.email == profile_data.email)
    ).first()
    
    if existing and existing.id != current_user.id:
        raise HTTPException(status_code=400, detail="Username or email already in use")

    current_user.name = profile_data.name
    current_user.username = profile_data.username
    current_user.email = profile_data.email
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/api/users/me/password")
def update_my_password(
    password_data: schemas.UserPasswordUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.get("/api/admin/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    return db.query(models.User).all()

@router.patch("/api/admin/users/{user_id}/ban", response_model=schemas.UserResponse)
def toggle_user_ban(user_id: int, db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot ban other administrators")
        
    user.is_banned = not user.is_banned
    db.commit()
    db.refresh(user)
    return user

@router.post("/api/admin/users/{user_id}/reset-password")
def admin_reset_password(
    user_id: int, 
    reset_data: schemas.AdminPasswordReset, 
    db: Session = Depends(get_db), 
    admin: models.User = Depends(get_admin_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(reset_data.new_password)
    db.commit()
    return {"message": f"Password reset successfully for user {user.username}"}