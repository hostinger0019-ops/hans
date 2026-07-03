#!/bin/bash
# ═══════════════════════════════════════════════════
# Tarik Clothing Backend — One-Click Setup Script
# Run this in your GCP JupyterLab terminal
# ═══════════════════════════════════════════════════

set -e

echo "🚀 Setting up Tarik Clothing Backend..."

# Create project directory
mkdir -p ~/tarik-backend/routes
mkdir -p ~/tarik-backend/uploads
cd ~/tarik-backend

# ─── requirements.txt ───
cat > requirements.txt << 'REQEOF'
fastapi==0.115.0
uvicorn==0.34.0
sqlalchemy==2.0.36
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.18
aiofiles==24.1.0
REQEOF

# ─── database.py ───
cat > database.py << 'DBEOF'
import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "tarik_store.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, nullable=False)
    compare_price = Column(Float, nullable=True)
    category = Column(String(50), nullable=False, default="Men")
    subcategory = Column(String(50), default="")
    sizes = Column(Text, default="[]")
    colors = Column(Text, default="[]")
    stock = Column(Integer, default=0)
    images = Column(Text, default="[]")
    videos = Column(Text, default="[]")
    rating = Column(Float, default=0.0)
    reviews = Column(Integer, default=0)
    status = Column(String(20), default="published")
    featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String(50), unique=True, nullable=False)
    customer_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), default="")
    address = Column(Text, default="")
    city = Column(String(100), default="")
    state = Column(String(100), default="")
    pincode = Column(String(10), default="")
    items = Column(Text, default="[]")
    item_count = Column(Integer, default=0)
    subtotal = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    shipping_cost = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    payment_method = Column(String(20), default="cod")
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
DBEOF

# ─── routes/__init__.py ───
cat > routes/__init__.py << 'INITEOF'
# Routes package
INITEOF

# ─── routes/auth.py ───
cat > routes/auth.py << 'AUTHEOF'
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt

from database import get_db, Admin

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
security = HTTPBearer()

SECRET_KEY = "tarik-clothing-secret-key-change-in-production-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str
    name: str
    email: str

class AdminInfo(BaseModel):
    id: int
    name: str
    email: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)

def create_access_token(data):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    admin = db.query(Admin).filter(Admin.email == email).first()
    if admin is None:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.email == request.email).first()
    if not admin or not verify_password(request.password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token({"sub": admin.email})
    return TokenResponse(token=token, name=admin.name, email=admin.email)

@router.get("/me", response_model=AdminInfo)
def get_me(admin: Admin = Depends(get_current_admin)):
    return AdminInfo(id=admin.id, name=admin.name, email=admin.email)
AUTHEOF

# ─── routes/products.py ───
cat > routes/products.py << 'PRODEOF'
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db, Product
from routes.auth import get_current_admin

router = APIRouter(prefix="/api/products", tags=["Products"])

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
    status: Optional[str] = None
    featured: Optional[bool] = None

def product_to_dict(p):
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
    if category:
        query = query.filter(Product.category == category)
    if status:
        query = query.filter(Product.status == status)
    if featured is not None:
        query = query.filter(Product.featured == featured)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%") | Product.category.ilike(f"%{search}%"))
    if sort == "price-asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price-desc":
        query = query.order_by(Product.price.desc())
    elif sort == "rating":
        query = query.order_by(desc(Product.rating))
    elif sort == "popular":
        query = query.order_by(desc(Product.reviews))
    else:
        query = query.order_by(desc(Product.created_at))
    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()
    return {"products": [product_to_dict(p) for p in products], "total": total, "page": page, "pages": (total + limit - 1) // limit}

@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_dict(product)

@router.post("", status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    product = Product(
        name=data.name, description=data.description, price=data.price,
        compare_price=data.compare_price, category=data.category, subcategory=data.subcategory,
        sizes=json.dumps(data.sizes), colors=json.dumps(data.colors), stock=data.stock,
        images=json.dumps(data.images), videos=json.dumps(data.videos),
        status=data.status, featured=data.featured,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product_to_dict(product)

@router.put("/{product_id}")
def update_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = data.model_dump(exclude_unset=True)
    for field in ["sizes", "colors", "images", "videos"]:
        if field in update_data:
            update_data[field] = json.dumps(update_data[field])
    for key, value in update_data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product_to_dict(product)

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
PRODEOF

# ─── routes/orders.py ───
cat > routes/orders.py << 'ORDEOF'
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from database import get_db, Order
from routes.auth import get_current_admin

router = APIRouter(prefix="/api/orders", tags=["Orders"])

class CartItem(BaseModel):
    id: int
    name: str
    price: float
    image: str
    size: str = ""
    color: str = ""
    quantity: int = 1

class OrderCreate(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    address: str
    apartment: str = ""
    city: str
    state: str
    pincode: str
    paymentMethod: str = "cod"
    items: List[CartItem]
    subtotal: float
    discount: float = 0
    shippingCost: float = 0
    total: float

class StatusUpdate(BaseModel):
    status: str

def order_to_dict(o):
    return {
        "id": o.order_id,
        "customer": o.customer_name,
        "email": o.email,
        "phone": o.phone,
        "address": f"{o.city}, {o.state}",
        "fullAddress": f"{o.address}, {o.city}, {o.state} - {o.pincode}",
        "items": o.item_count,
        "itemDetails": json.loads(o.items) if o.items else [],
        "subtotal": o.subtotal,
        "discount": o.discount,
        "shippingCost": o.shipping_cost,
        "total": o.total,
        "paymentMethod": o.payment_method,
        "status": o.status,
        "date": o.created_at.strftime("%Y-%m-%d") if o.created_at else "",
    }

@router.get("")
def list_orders(status: Optional[str] = None, search: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=100), db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    query = db.query(Order)
    if status and status != "All":
        query = query.filter(Order.status == status)
    if search:
        query = query.filter(Order.customer_name.ilike(f"%{search}%") | Order.order_id.ilike(f"%{search}%") | Order.email.ilike(f"%{search}%"))
    total = query.count()
    orders = query.order_by(desc(Order.created_at)).offset((page - 1) * limit).limit(limit).all()
    return {"orders": [order_to_dict(o) for o in orders], "total": total, "page": page, "pages": (total + limit - 1) // limit}

@router.post("", status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    order_id = f"TRK-{int(datetime.utcnow().timestamp())}"
    order = Order(
        order_id=order_id, customer_name=f"{data.firstName} {data.lastName}",
        email=data.email, phone=data.phone,
        address=f"{data.address}{', ' + data.apartment if data.apartment else ''}",
        city=data.city, state=data.state, pincode=data.pincode,
        items=json.dumps([item.model_dump() for item in data.items]),
        item_count=sum(item.quantity for item in data.items),
        subtotal=data.subtotal, discount=data.discount, shipping_cost=data.shippingCost,
        total=data.total, payment_method=data.paymentMethod, status="pending",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return {"orderId": order.order_id, "message": "Order placed successfully"}

@router.put("/{order_id}/status")
def update_order_status(order_id: str, data: StatusUpdate, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    db.commit()
    return {"message": f"Order {order_id} updated to {data.status}"}

@router.get("/stats")
def order_stats(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    orders = db.query(Order).all()
    return {
        "totalRevenue": sum(o.total for o in orders),
        "totalOrders": len(orders),
        "totalCustomers": len(set(o.email for o in orders)),
        "pendingOrders": sum(1 for o in orders if o.status == "pending"),
        "deliveredOrders": sum(1 for o in orders if o.status == "delivered"),
    }
ORDEOF

# ─── routes/upload.py ───
cat > routes/upload.py << 'UPLEOF'
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from routes.auth import get_current_admin

router = APIRouter(prefix="/api/upload", tags=["Upload"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".webm"}
MAX_FILE_SIZE = 50 * 1024 * 1024

@router.post("")
async def upload_file(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as f:
        f.write(content)
    return {"url": f"/api/upload/files/{unique_name}", "filename": unique_name, "originalName": file.filename, "size": len(content)}

@router.get("/files/{filename}")
async def serve_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
UPLEOF

# ─── main.py ───
cat > main.py << 'MAINEOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from routes import auth, products, orders, upload

app = FastAPI(title="Tarik Clothing API", description="Backend API for Tarik Clothing e-commerce store", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(upload.router)

@app.on_event("startup")
def startup():
    create_tables()
    print("Database tables created")
    print("Tarik Clothing API is running!")

@app.get("/")
def root():
    return {"status": "ok", "message": "Tarik Clothing API v1.0"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}
MAINEOF

# ─── seed.py ───
cat > seed.py << 'SEEDEOF'
import json
from database import create_tables, SessionLocal, Product, Order, Admin
from routes.auth import hash_password

def seed():
    create_tables()
    db = SessionLocal()
    if not db.query(Admin).first():
        admin = Admin(name="Tarik Admin", email="admin@tarikclothing.com", password_hash=hash_password("admin123"))
        db.add(admin)
        print("Admin created: admin@tarikclothing.com / admin123")
    if not db.query(Product).first():
        products_data = [
            {"name": "Premium Leather Jacket", "description": "Handcrafted genuine leather jacket with modern slim fit.", "price": 4999, "compare_price": 7999, "category": "Men", "subcategory": "Jackets", "sizes": ["S","M","L","XL"], "colors": ["Black","Brown"], "stock": 45, "images": ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80"], "rating": 4.8, "reviews": 124, "featured": True},
            {"name": "Oversized Graphic Tee", "description": "Premium cotton oversized tee with exclusive graphic print.", "price": 1299, "compare_price": 1999, "category": "Unisex", "subcategory": "T-Shirts", "sizes": ["S","M","L","XL","XXL"], "colors": ["Black","White","Grey"], "stock": 200, "images": ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80"], "rating": 4.6, "reviews": 89, "featured": True},
            {"name": "Slim Fit Chinos", "description": "Premium stretch cotton chinos with modern slim fit.", "price": 2499, "compare_price": 3499, "category": "Men", "subcategory": "Pants", "sizes": ["28","30","32","34","36"], "colors": ["Khaki","Navy","Olive"], "stock": 120, "images": ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80"], "rating": 4.7, "reviews": 203},
            {"name": "Floral Wrap Dress", "description": "Elegant floral wrap dress crafted from premium viscose.", "price": 3299, "compare_price": 4999, "category": "Women", "subcategory": "Dresses", "sizes": ["XS","S","M","L"], "colors": ["Burgundy","Navy"], "stock": 65, "images": ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80"], "rating": 4.9, "reviews": 156, "featured": True},
            {"name": "Denim Trucker Jacket", "description": "Classic denim trucker jacket with premium selvedge denim.", "price": 3799, "compare_price": 5499, "category": "Unisex", "subcategory": "Jackets", "sizes": ["S","M","L","XL"], "colors": ["Indigo","Light Wash","Black"], "stock": 78, "images": ["https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=500&q=80"], "rating": 4.5, "reviews": 67},
            {"name": "Silk Blend Blazer", "description": "Luxurious silk-blend blazer with Italian craftsmanship.", "price": 8999, "compare_price": 12999, "category": "Women", "subcategory": "Blazers", "sizes": ["XS","S","M","L"], "colors": ["Ivory","Black"], "stock": 30, "images": ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80"], "rating": 4.9, "reviews": 42, "featured": True},
            {"name": "Urban Cargo Pants", "description": "Modern utility cargo pants with tapered fit.", "price": 2799, "compare_price": 3999, "category": "Men", "subcategory": "Pants", "sizes": ["S","M","L","XL"], "colors": ["Black","Olive","Beige"], "stock": 150, "images": ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80"], "rating": 4.4, "reviews": 178},
            {"name": "Classic Hoodie", "description": "Premium heavyweight cotton hoodie with minimalist design.", "price": 1799, "compare_price": 2499, "category": "Unisex", "subcategory": "Hoodies", "sizes": ["S","M","L","XL","XXL"], "colors": ["Black","Grey","Navy","Forest Green"], "stock": 95, "images": ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"], "rating": 4.6, "reviews": 145},
        ]
        for p in products_data:
            product = Product(name=p["name"], description=p["description"], price=p["price"], compare_price=p.get("compare_price"), category=p["category"], subcategory=p.get("subcategory",""), sizes=json.dumps(p.get("sizes",[])), colors=json.dumps(p.get("colors",[])), stock=p.get("stock",0), images=json.dumps(p.get("images",[])), videos=json.dumps([]), rating=p.get("rating",0), reviews=p.get("reviews",0), status="published", featured=p.get("featured",False))
            db.add(product)
        print(f"Seeded {len(products_data)} products")
    if not db.query(Order).first():
        for o in [
            {"order_id":"TRK-001","customer_name":"Aisha Khan","email":"aisha@example.com","item_count":3,"total":9797,"status":"delivered"},
            {"order_id":"TRK-002","customer_name":"Rahul Sharma","email":"rahul@example.com","item_count":1,"total":4999,"status":"shipped"},
            {"order_id":"TRK-003","customer_name":"Priya Patel","email":"priya@example.com","item_count":2,"total":5098,"status":"processing"},
            {"order_id":"TRK-004","customer_name":"Vikram Singh","email":"vikram@example.com","item_count":4,"total":12296,"status":"pending"},
            {"order_id":"TRK-005","customer_name":"Neha Gupta","email":"neha@example.com","item_count":1,"total":3299,"status":"delivered"},
            {"order_id":"TRK-006","customer_name":"Arjun Reddy","email":"arjun@example.com","item_count":2,"total":6498,"status":"shipped"},
        ]:
            db.add(Order(order_id=o["order_id"], customer_name=o["customer_name"], email=o["email"], item_count=o["item_count"], total=o["total"], status=o["status"], items=json.dumps([])))
        print("Seeded 6 orders")
    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
SEEDEOF

echo ""
echo "✅ All files created in ~/tarik-backend/"
echo ""
echo "📦 Now run these commands:"
echo "   cd ~/tarik-backend"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate"
echo "   pip install -r requirements.txt"
echo "   python seed.py"
echo "   uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
