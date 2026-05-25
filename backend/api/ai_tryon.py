from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
# Apne config ke hisab se imports check kar lena:
# from app.db.session import get_db 
# from app.models.product import Product
from services import ai_service

router = APIRouter(prefix="/ai", tags=["AI Try-On"])

@router.post("/tryon")
async def virtual_try_on(product_id: int, user_image: UploadFile = File(...)):
    # 1. Validation: Sirf images allowed hain
    if not user_image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    try:
        # 2. User ki image ke bytes read karo
        image_bytes = await user_image.read()
        
        # 3. DB se product_id ke base par product image nikalne ka step (Mocked right now)
        # product = db.query(Product).filter(Product.id == product_id).first()
        # product_url = product.image_url
        product_url = "dummy_product_url" 

        # 4. AI Service ko call karo
        result_url = await ai_service.process_tryon(product_url, image_bytes)
        
        return {"success": True, "processed_image_url": result_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Processing Failed: {str(e)}")