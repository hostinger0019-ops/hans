from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_tables, migrate_tables
from routes import auth, products, orders, upload, reels, payment, shiprocket

# ─── Create App ───
app = FastAPI(
    title="Tarik Clothing API",
    description="Backend API for Tarik Clothing e-commerce store",
    version="1.0.0",
)

# ─── CORS — Allow frontend origins ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*",  # Allow all for development — restrict in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Include Routers ───
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(upload.router)
app.include_router(reels.router)
app.include_router(payment.router)
app.include_router(shiprocket.router)

# ─── Startup ───
@app.on_event("startup")
def startup():
    create_tables()
    migrate_tables()
    print("✅ Database tables created & migrated")
    print("🚀 Tarik Clothing API is running!")

# ─── Health Check ───
@app.get("/")
def root():
    return {"status": "ok", "message": "Tarik Clothing API v1.0"}

@app.get("/api/health")
def health():
    return {"status": "healthy"}
