import os
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Database file path
DB_PATH = os.path.join(os.path.dirname(__file__), "tarik_store.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Models ───

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, nullable=False)
    compare_price = Column(Float, nullable=True)
    category = Column(String(50), nullable=False, default="Men")
    subcategory = Column(String(50), default="")
    sizes = Column(Text, default="[]")          # JSON array string
    colors = Column(Text, default="[]")         # JSON array string
    stock = Column(Integer, default=0)
    images = Column(Text, default="[]")         # JSON array string
    videos = Column(Text, default="[]")         # JSON array string
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
    items = Column(Text, default="[]")          # JSON array of cart items
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


# ─── DB Helpers ───

def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
