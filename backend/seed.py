"""
Seed script — Run once to populate the database with default products and admin.
Usage: python seed.py
"""
import json
from database import create_tables, SessionLocal, Product, Order, Admin
from routes.auth import hash_password


def seed():
    create_tables()
    db = SessionLocal()

    # ─── Seed Admin ───
    if not db.query(Admin).first():
        admin = Admin(
            name="Tarik Admin",
            email="admin@tarikclothing.com",
            password_hash=hash_password("admin123"),
        )
        db.add(admin)
        print("✅ Admin created: admin@tarikclothing.com / admin123")

    # ─── Seed Products ───
    if not db.query(Product).first():
        products = [
            {
                "name": "Premium Leather Jacket",
                "description": "Handcrafted genuine leather jacket with a modern slim fit. Features premium YKK zippers and satin lining for ultimate comfort.",
                "price": 4999,
                "compare_price": 7999,
                "category": "Men",
                "subcategory": "Jackets",
                "sizes": ["S", "M", "L", "XL"],
                "colors": ["Black", "Brown"],
                "stock": 45,
                "images": ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80"],
                "rating": 4.8,
                "reviews": 124,
                "featured": True,
            },
            {
                "name": "Oversized Graphic Tee",
                "description": "Premium cotton oversized tee with exclusive graphic print. Relaxed fit for maximum comfort and street style appeal.",
                "price": 1299,
                "compare_price": 1999,
                "category": "Unisex",
                "subcategory": "T-Shirts",
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "colors": ["Black", "White", "Grey"],
                "stock": 200,
                "images": ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80"],
                "rating": 4.6,
                "reviews": 89,
                "featured": True,
            },
            {
                "name": "Slim Fit Chinos",
                "description": "Premium stretch cotton chinos with a modern slim fit. Perfect for both casual and semi-formal occasions.",
                "price": 2499,
                "compare_price": 3499,
                "category": "Men",
                "subcategory": "Pants",
                "sizes": ["28", "30", "32", "34", "36"],
                "colors": ["Khaki", "Navy", "Olive"],
                "stock": 120,
                "images": ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&q=80"],
                "rating": 4.7,
                "reviews": 203,
            },
            {
                "name": "Floral Wrap Dress",
                "description": "Elegant floral wrap dress crafted from premium viscose fabric. Features adjustable waist tie and flowy silhouette.",
                "price": 3299,
                "compare_price": 4999,
                "category": "Women",
                "subcategory": "Dresses",
                "sizes": ["XS", "S", "M", "L"],
                "colors": ["Burgundy", "Navy"],
                "stock": 65,
                "images": ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80"],
                "rating": 4.9,
                "reviews": 156,
                "featured": True,
            },
            {
                "name": "Denim Trucker Jacket",
                "description": "Classic denim trucker jacket with modern updates. Premium selvedge denim with copper button hardware.",
                "price": 3799,
                "compare_price": 5499,
                "category": "Unisex",
                "subcategory": "Jackets",
                "sizes": ["S", "M", "L", "XL"],
                "colors": ["Indigo", "Light Wash", "Black"],
                "stock": 78,
                "images": ["https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=500&q=80"],
                "rating": 4.5,
                "reviews": 67,
            },
            {
                "name": "Silk Blend Blazer",
                "description": "Luxurious silk-blend blazer with Italian craftsmanship. Peak lapels, dual vents, and horn buttons.",
                "price": 8999,
                "compare_price": 12999,
                "category": "Women",
                "subcategory": "Blazers",
                "sizes": ["XS", "S", "M", "L"],
                "colors": ["Ivory", "Black"],
                "stock": 30,
                "images": ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500&q=80"],
                "rating": 4.9,
                "reviews": 42,
                "featured": True,
            },
            {
                "name": "Urban Cargo Pants",
                "description": "Modern utility cargo pants with tapered fit. Multiple pockets with secure zip closures and adjustable hem.",
                "price": 2799,
                "compare_price": 3999,
                "category": "Men",
                "subcategory": "Pants",
                "sizes": ["S", "M", "L", "XL"],
                "colors": ["Black", "Olive", "Beige"],
                "stock": 150,
                "images": ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80"],
                "rating": 4.4,
                "reviews": 178,
            },
            {
                "name": "Classic Hoodie",
                "description": "Premium heavyweight cotton hoodie with minimalist design. Double-layered hood and kangaroo pocket.",
                "price": 1799,
                "compare_price": 2499,
                "category": "Unisex",
                "subcategory": "Hoodies",
                "sizes": ["S", "M", "L", "XL", "XXL"],
                "colors": ["Black", "Grey", "Navy", "Forest Green"],
                "stock": 95,
                "images": ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"],
                "rating": 4.6,
                "reviews": 145,
            },
        ]

        for p_data in products:
            product = Product(
                name=p_data["name"],
                description=p_data["description"],
                price=p_data["price"],
                compare_price=p_data.get("compare_price"),
                category=p_data["category"],
                subcategory=p_data.get("subcategory", ""),
                sizes=json.dumps(p_data.get("sizes", [])),
                colors=json.dumps(p_data.get("colors", [])),
                stock=p_data.get("stock", 0),
                images=json.dumps(p_data.get("images", [])),
                videos=json.dumps([]),
                rating=p_data.get("rating", 0),
                reviews=p_data.get("reviews", 0),
                status="published",
                featured=p_data.get("featured", False),
            )
            db.add(product)

        print(f"✅ Seeded {len(products)} products")

    # ─── Seed Orders ───
    if not db.query(Order).first():
        default_orders = [
            {"order_id": "TRK-001", "customer_name": "Aisha Khan", "email": "aisha@example.com", "item_count": 3, "total": 9797, "status": "delivered"},
            {"order_id": "TRK-002", "customer_name": "Rahul Sharma", "email": "rahul@example.com", "item_count": 1, "total": 4999, "status": "shipped"},
            {"order_id": "TRK-003", "customer_name": "Priya Patel", "email": "priya@example.com", "item_count": 2, "total": 5098, "status": "processing"},
            {"order_id": "TRK-004", "customer_name": "Vikram Singh", "email": "vikram@example.com", "item_count": 4, "total": 12296, "status": "pending"},
            {"order_id": "TRK-005", "customer_name": "Neha Gupta", "email": "neha@example.com", "item_count": 1, "total": 3299, "status": "delivered"},
            {"order_id": "TRK-006", "customer_name": "Arjun Reddy", "email": "arjun@example.com", "item_count": 2, "total": 6498, "status": "shipped"},
        ]

        for o_data in default_orders:
            order = Order(
                order_id=o_data["order_id"],
                customer_name=o_data["customer_name"],
                email=o_data["email"],
                item_count=o_data["item_count"],
                total=o_data["total"],
                status=o_data["status"],
                items=json.dumps([]),
            )
            db.add(order)

        print(f"✅ Seeded {len(default_orders)} orders")

    db.commit()
    db.close()
    print("🎉 Database seeded successfully!")


if __name__ == "__main__":
    seed()
