import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, Product
from routes.auth import get_current_admin

router = APIRouter(prefix="/api/products", tags=["Products"])


# ─── Schemas ───

class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    compare_price: Optional[float] = None
    category: str = "Men"
    subcategory: str = ""
    sizes: List[str] = []
    colors: List[str] = []
    stock: int = 0
    images: List[str] = []
    videos: List[str] = []
    rating: float = 0.0
    reviews: int = 0
    status: str = "published"
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    status: Optional[str] = None
    featured: Optional[bool] = None

class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    comparePrice: Optional[float]
    category: str
    subcategory: str
    sizes: List[str]
    colors: List[str]
    stock: int
    images: List[str]
    videos: List[str]
    rating: float
    reviews: int
    status: str
    featured: bool
    createdAt: str

    class Config:
        from_attributes = True


# ─── Helpers ───

def product_to_dict(p: Product) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "description": p.description or "",
        "price": p.price,
        "comparePrice": p.compare_price,
        "category": p.category,
        "subcategory": p.subcategory or "",
        "sizes": json.loads(p.sizes) if p.sizes else [],
        "colors": json.loads(p.colors) if p.colors else [],
        "stock": p.stock,
        "images": json.loads(p.images) if p.images else [],
        "videos": json.loads(p.videos) if p.videos else [],
        "rating": p.rating or 0,
        "reviews": p.reviews or 0,
        "status": p.status,
        "featured": p.featured,
        "createdAt": p.created_at.strftime("%Y-%m-%d") if p.created_at else "",
    }


# ─── Routes ───

@router.get("")
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    featured: Optional[bool] = None,
    sort: str = "newest",
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    # Filters
    if category:
        query = query.filter(Product.category == category)
    if status:
        query = query.filter(Product.status == status)
    if featured is not None:
        query = query.filter(Product.featured == featured)
    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%") |
            Product.description.ilike(f"%{search}%") |
            Product.category.ilike(f"%{search}%")
        )

    # Sort
    if sort == "price-asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price-desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(desc(Product.rating))
    elif sort == "popular":
        query = query.order_by(desc(Product.reviews))
    else:  # newest
        query = query.order_by(desc(Product.created_at))

    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "products": [product_to_dict(p) for p in products],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_dict(product)


@router.post("", status_code=201)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    product = Product(
        name=data.name,
        description=data.description,
        price=data.price,
        compare_price=data.compare_price,
        category=data.category,
        subcategory=data.subcategory,
        sizes=json.dumps(data.sizes),
        colors=json.dumps(data.colors),
        stock=data.stock,
        images=json.dumps(data.images),
        videos=json.dumps(data.videos),
        rating=data.rating,
        reviews=data.reviews,
        status=data.status,
        featured=data.featured,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product_to_dict(product)


@router.put("/{product_id}")
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = data.model_dump(exclude_unset=True)

    # Convert lists to JSON strings for DB
    for field in ["sizes", "colors", "images", "videos"]:
        if field in update_data:
            update_data[field] = json.dumps(update_data[field])

    # Map camelCase to snake_case
    if "compare_price" in update_data:
        pass  # already correct

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product_to_dict(product)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
