from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from db.session import SessionLocal
from schemas.product import ProductCreate, ProductResponse
from services import product_service
from core.dependencies import get_admin_user
from models.user import User
from services.s3_service import upload_image

router = APIRouter(prefix="/products", tags=["Products"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[ProductResponse])
def get_products(
    page: int = 1,
    limit: int=10,
    min_price: float | None = None,
    max_price: float | None = None,
    search: str | None = None,
    sort: str | None = None,
    db: Session = Depends(get_db)):
    return product_service.get_products(db,page,limit,min_price,max_price,search,sort)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return product_service.create_product(db, product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    
    updated = product_service.update_product(db, product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    deleted = product_service.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Deleted successfully"}

@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    _: User = Depends(get_admin_user)
):
    file_bytes = await file.read()
    url = upload_image(file_bytes, file.filename, file.content_type)
    return {"image_url": url}