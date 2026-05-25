import boto3
import os
import uuid

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION")
)

BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
REGION = os.getenv("AWS_REGION")

def upload_image(file_bytes: bytes, filename: str, content_type: str) -> str:
    ext = filename.split(".")[-1]
    unique_name = f"products/{uuid.uuid4()}.{ext}"
    
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=unique_name,
        Body=file_bytes,
        ContentType=content_type
    )
    
    url = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{unique_name}"
    return url

# --- ✨ NAYA FUNCTION: User Specific Try-On Uploads ---
def upload_user_tryon_image(file_bytes: bytes, filename: str, content_type: str, user_id: int, is_processed: bool = False) -> str:
    """
    Logged-in user ke unique folder me image upload karega.
    is_processed=False -> users/user_3/tryon_raw/...
    is_processed=True  -> users/user_3/tryon_processed/...
    """
    ext = filename.split(".")[-1]
    
    # Folder path configuration based on input
    folder_type = "tryon_processed" if is_processed else "tryon_raw"
    unique_name = f"users/user_{user_id}/{folder_type}/{uuid.uuid4()}.{ext}"
    
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=unique_name,
        Body=file_bytes,
        ContentType=content_type
    )
    
    return f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{unique_name}"