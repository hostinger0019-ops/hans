import razorpay
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/payment", tags=["Payment"])

# ─── Razorpay Credentials ───
RAZORPAY_KEY_ID = "rzp_live_TBI7uKecttibrI"
RAZORPAY_KEY_SECRET = "1MCK0WVrVfUHR3vZ1CmsPJ2G"

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


class OrderRequest(BaseModel):
    amount: int  # Amount in rupees
    currency: str = "INR"


class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/create-order")
def create_order(req: OrderRequest):
    """Create a Razorpay order (server-side) — required for live mode."""
    try:
        order_data = {
            "amount": req.amount * 100,  # Convert rupees to paise
            "currency": req.currency,
            "payment_capture": 1,  # Auto-capture payment
        }
        order = client.order.create(data=order_data)
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify")
def verify_payment(req: VerifyRequest):
    """Verify Razorpay payment signature."""
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": req.razorpay_order_id,
            "razorpay_payment_id": req.razorpay_payment_id,
            "razorpay_signature": req.razorpay_signature,
        })
        return {"status": "success", "message": "Payment verified"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed")
