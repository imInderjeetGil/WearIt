<h4>My api can now do these: </h4>
<ul>
<li>Pagination</li>
<li>Filtering</li>
<li>Search</li>
<li>Sorting</li>
</ul>

<h4>Left at auth, issue password getting longer than 72 bytes idk why but we'll fix it</h4>

SOLVED upper problem (it's versioning problem)

NOW, we've added authentication and autherization for which our product table has updated with a column user_id so we can track who created the product, while other's can only see it.

NOW, i,m going to export my old product data as csv and later add column and again import data to the product table.

UI abhi ke liye kaam chalau ho gaya hai

Now DEPLOYMENT begins

docker file me thoda dhyaan dena if something goes wrong!

## Project: Inventory → E-Commerce Store (Single Vendor)

### STACK
- FastAPI + SQLAlchemy + PostgreSQL
- JWT Authentication + Passlib bcrypt
- Jinja2 Templates + TailwindCSS
- Docker + Nginx + AWS EC2
- CI/CD via GitHub Actions → DockerHub → EC2

### PHASE 1 — Auth Overhaul ✅ COMPLETE

- Added `name` and `role` (admin/customer) columns to User model
- `role` auto-assigns to "customer" on register
- Added `UserResponse` schema (safe, never exposes password)
- Added `get_admin_user` dependency in `core/dependencies.py`
- Product create/edit/delete locked to admin only
- Customers can only browse products
- One-time `/auth/create-admin` route (locks after first admin created)
- Register UI page added (`/register-ui`)
- Nav dynamically shows Login+Register when logged out, Logout when logged in
- Admin user created in DB

### PHASE 2 — Cart & Shopping ⏳ IN PROGRESS

#### Done so far:
- `models/cart.py` — CartItem table (user_id, product_id, quantity)
- `schemas/cart.py` — CartItemAdd, CartItemResponse
- `services/cart_service.py` — get_cart, add_to_cart, remove_from_cart, clear_cart

#### Still to do:
- `api/cart.py` — cart routes
- Register cart router in `main.py`
- `templates/cart.html`
- `static/js/cart.js`

### PHASE 3 — Orders (PENDING)
- Order model (user → products → quantity → status)
- Checkout flow
- Order history for customers
- Admin can view all orders

### PHASE 4 — Payments (PENDING)
- Razorpay integration
- Payment confirmation → clear cart → update order status
- Success/failure pages

### PHASE 5 — UI Polish (PENDING)
- Product images
- Make it look like a real store
- Mobile responsive

### IMPORTANT NOTES
- bcrypt pinned to 3.2.2 (versioning fix)
- Password truncated to 72 bytes in security.py
- get_db() is duplicated in api/ files — to be cleaned up later
- Cart is cleared ONLY after Razorpay payment confirmed (not before)
- Local DB: manually ran ALTER TABLE to add name/role columns
- EC2: wiped volume and recreated tables fresh