from fastapi import FastAPI
from db.session import engine
from models import user, product, cart, order, review
from db.base import Base
from api import product, auth, cart, order, payment, review
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

Base.metadata.create_all(bind=engine)
load_dotenv()

ENV = os.getenv("ENV")

if ENV == "prod":
    app = FastAPI(title="WearIt API", docs_url=None, redoc_url=None)
else:
    app = FastAPI(title="WearIt API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(product.router)
app.include_router(auth.router)
app.include_router(cart.router)
app.include_router(order.router)
app.include_router(payment.router)
app.include_router(review.router)
