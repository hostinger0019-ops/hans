"""
Shiprocket S2S Login & Address Vault — OTP Verification Only
No order creation through Shiprocket.
"""

import hmac
import hashlib
import base64
import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/shiprocket", tags=["Shiprocket OTP"])

# ─── Shiprocket Checkout API credentials ───
API_KEY = "siwnwhWwtcgiXP0n"
API_SECRET = "DQNt6bVZ31pm2l1PCPob22pZYT0sJQeg"
BASE_URL = "https://checkout-api.shiprocket.com"


# ─── HMAC Helper ───

def compute_hmac(payload_str: str) -> str:
    """Compute HMAC-SHA256 of the payload string, return Base64 encoded."""
    signature = hmac.new(
        API_SECRET.encode("utf-8"),
        payload_str.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return base64.b64encode(signature).decode("utf-8")


def get_headers(payload_str: str) -> dict:
    """Build request headers with API key and HMAC signature."""
    return {
        "Content-Type": "application/json",
        "X-Api-Key": API_KEY,
        "X-Api-HMAC-SHA256": compute_hmac(payload_str),
    }


# ─── Schemas ───

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    token: str
    otp: str

class FetchAddressRequest(BaseModel):
    customer_token: str


# ─── Routes ───

@router.post("/send-otp")
async def send_otp(data: SendOTPRequest):
    """Send OTP to customer's phone via Shiprocket."""
    phone = data.phone.strip().replace("+91", "").replace(" ", "")
    if len(phone) != 10 or not phone.isdigit():
        raise HTTPException(status_code=400, detail="Invalid phone number. Must be 10 digits.")

    payload = {
        "phone": phone,
        "modes": ["SMS"],
    }
    payload_str = json.dumps(payload, separators=(",", ":"))
    headers = get_headers(payload_str)

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{BASE_URL}/s2s-login/initiate",
                content=payload_str,
                headers=headers,
            )
        result = resp.json()

        if resp.status_code == 200 and result.get("token"):
            return {
                "success": True,
                "token": result["token"],
                "message": "OTP sent successfully",
            }
        else:
            return {
                "success": False,
                "message": result.get("message", "Failed to send OTP"),
                "detail": result,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shiprocket API error: {str(e)}")


@router.post("/verify-otp")
async def verify_otp(data: VerifyOTPRequest):
    """Verify OTP and get customer authorized token + saved addresses."""
    payload = {
        "token": data.token,
        "otp": data.otp.strip(),
    }
    payload_str = json.dumps(payload, separators=(",", ":"))
    headers = get_headers(payload_str)

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{BASE_URL}/s2s-login/verify",
                content=payload_str,
                headers=headers,
            )
        result = resp.json()

        if resp.status_code == 200 and result.get("customer_token"):
            # OTP verified — now fetch saved addresses
            addresses = await fetch_addresses_internal(result["customer_token"])
            return {
                "success": True,
                "verified": True,
                "customer_token": result["customer_token"],
                "addresses": addresses,
                "message": "Phone verified successfully",
            }
        else:
            return {
                "success": False,
                "verified": False,
                "message": result.get("message", "Invalid OTP"),
                "detail": result,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shiprocket API error: {str(e)}")


async def fetch_addresses_internal(customer_token: str) -> list:
    """Fetch saved addresses from Shiprocket Address Vault."""
    payload = {"customer_token": customer_token}
    payload_str = json.dumps(payload, separators=(",", ":"))
    headers = get_headers(payload_str)

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{BASE_URL}/s2s-login/fetch-address",
                content=payload_str,
                headers=headers,
            )
        result = resp.json()

        if resp.status_code == 200 and result.get("addresses"):
            return result["addresses"]
        return []
    except Exception:
        return []


@router.post("/fetch-addresses")
async def fetch_addresses(data: FetchAddressRequest):
    """Public endpoint to fetch saved addresses."""
    addresses = await fetch_addresses_internal(data.customer_token)
    return {"success": True, "addresses": addresses}
