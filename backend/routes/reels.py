from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db, Reel

router = APIRouter(prefix="/api/reels", tags=["reels"])


# ─── Schemas ───

class ReelCreate(BaseModel):
    video_url: str
    caption: str = ""
    product_id: Optional[int] = None
    product_name: str = ""
    product_price: float = 0.0


class ReelOut(BaseModel):
    id: int
    video_url: str
    caption: str
    product_id: Optional[int]
    product_name: str
    product_price: float
    created_at: str

    class Config:
        from_attributes = True


class ReelUpdate(BaseModel):
    caption: Optional[str] = None
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    product_price: Optional[float] = None


# ─── Routes ───

@router.get("")
def list_reels(db: Session = Depends(get_db)):
    reels = db.query(Reel).order_by(Reel.created_at.desc()).all()
    return {
        "reels": [
            {
                "id": r.id,
                "videoUrl": r.video_url,
                "caption": r.caption,
                "productId": r.product_id,
                "productName": r.product_name,
                "productPrice": r.product_price,
                "thumbnail": r.video_url,
                "username": "@tarikclothing",
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "createdAt": r.created_at.isoformat() if r.created_at else "",
            }
            for r in reels
        ]
    }


@router.post("")
def create_reel(reel: ReelCreate, db: Session = Depends(get_db)):
    db_reel = Reel(
        video_url=reel.video_url,
        caption=reel.caption,
        product_id=reel.product_id,
        product_name=reel.product_name,
        product_price=reel.product_price,
    )
    db.add(db_reel)
    db.commit()
    db.refresh(db_reel)
    return {"success": True, "id": db_reel.id}


@router.put("/{reel_id}")
def update_reel(reel_id: int, data: ReelUpdate, db: Session = Depends(get_db)):
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    if data.caption is not None:
        reel.caption = data.caption
    if data.product_id is not None:
        reel.product_id = data.product_id
    if data.product_name is not None:
        reel.product_name = data.product_name
    if data.product_price is not None:
        reel.product_price = data.product_price
    db.commit()
    db.refresh(reel)
    return {"success": True}


@router.delete("/{reel_id}")
def delete_reel(reel_id: int, db: Session = Depends(get_db)):
    reel = db.query(Reel).filter(Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    db.delete(reel)
    db.commit()
    return {"success": True}
