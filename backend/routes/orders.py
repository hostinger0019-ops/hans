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


# ─── Schemas ───

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


# ─── Helpers ───

def order_to_dict(o: Order) -> dict:
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


# ─── Routes ───

@router.get("")
def list_orders(
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    query = db.query(Order)

    if status and status != "All":
        query = query.filter(Order.status == status)
    if search:
        query = query.filter(
            Order.customer_name.ilike(f"%{search}%") |
            Order.order_id.ilike(f"%{search}%") |
            Order.email.ilike(f"%{search}%")
        )

    total = query.count()
    orders = query.order_by(desc(Order.created_at)).offset((page - 1) * limit).limit(limit).all()

    return {
        "orders": [order_to_dict(o) for o in orders],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.post("", status_code=201)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    # Generate order ID
    order_id = f"TRK-{int(datetime.utcnow().timestamp())}"

    order = Order(
        order_id=order_id,
        customer_name=f"{data.firstName} {data.lastName}",
        email=data.email,
        phone=data.phone,
        address=f"{data.address}{', ' + data.apartment if data.apartment else ''}",
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        items=json.dumps([item.model_dump() for item in data.items]),
        item_count=sum(item.quantity for item in data.items),
        subtotal=data.subtotal,
        discount=data.discount,
        shipping_cost=data.shippingCost,
        total=data.total,
        payment_method=data.paymentMethod,
        status="pending",
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return {
        "orderId": order.order_id,
        "message": "Order placed successfully",
    }


@router.put("/{order_id}/status")
def update_order_status(
    order_id: str,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    admin=Depends(get_current_admin),
):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.status
    db.commit()
    return {"message": f"Order {order_id} updated to {data.status}"}


@router.get("/stats")
def order_stats(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    orders = db.query(Order).all()
    total_revenue = sum(o.total for o in orders)
    total_orders = len(orders)
    customers = len(set(o.email for o in orders))

    return {
        "totalRevenue": total_revenue,
        "totalOrders": total_orders,
        "totalCustomers": customers,
        "pendingOrders": sum(1 for o in orders if o.status == "pending"),
        "deliveredOrders": sum(1 for o in orders if o.status == "delivered"),
    }
