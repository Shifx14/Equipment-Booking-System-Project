from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
from auth_utils import get_admin_user

router = APIRouter(tags=["equipment"])

@router.get("/api/equipment", response_model=List[schemas.EquipmentResponse])
def get_equipment(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Equipment)
    if search:
        query = query.filter(models.Equipment.name.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(models.Equipment.category_id == category_id)
    if status:
        query = query.filter(models.Equipment.status == status)
    return query.all()

@router.post("/api/admin/equipment", response_model=schemas.EquipmentResponse)
def create_equipment(item: schemas.EquipmentCreate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    db_item = models.Equipment(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/api/admin/equipment/{item_id}", response_model=schemas.EquipmentResponse)
def update_equipment(item_id: int, item: schemas.EquipmentUpdate, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    db_item = db.query(models.Equipment).filter(models.Equipment.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    for key, value in item.dict(exclude_unset=True).items():
        setattr(db_item, key, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/api/admin/equipment/{item_id}")
def delete_equipment(item_id: int, db: Session = Depends(get_db), admin=Depends(get_admin_user)):
    db_item = db.query(models.Equipment).filter(models.Equipment.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Equipment deleted"}