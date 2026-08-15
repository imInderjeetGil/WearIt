import boto3
import os
import uuid

# Build the boto3 client using the normal AWS credential provider chain by
# default. Explicit AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY are only passed
# when present (local development). In production on EC2, both are absent and
# boto3 automatically uses the instance metadata / IAM role.
_client_kwargs = {"region_name": os.getenv("AWS_REGION")}
_access_key = os.getenv("AWS_ACCESS_KEY_ID")
_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
if _access_key and _secret_key:
    # Explicit credentials take priority; never mix a key with the IAM role.
    _client_kwargs["aws_access_key_id"] = _access_key
    _client_kwargs["aws_secret_access_key"] = _secret_key

s3_client = boto3.client("s3", **_client_kwargs)
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")
REGION = os.getenv("AWS_REGION")

def upload_image(file_bytes: bytes, filename: str, content_type: str, folder: str = "products") -> str:
    ext = filename.split(".")[-1]
    unique_name = f"{folder}/{uuid.uuid4()}.{ext}"

    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=unique_name,
        Body=file_bytes,
        ContentType=content_type
    )
    
    url = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{unique_name}"
    return url

