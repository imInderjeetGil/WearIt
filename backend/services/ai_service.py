import asyncio

class AIService:
    @staticmethod
    async def process_tryon(product_url: str, user_image_bytes: bytes) -> str:
        await asyncio.sleep(2)  # Simulate processing time
        
        processed_image_url = "https://example.com/processed_image.jpg"
        return processed_image_url
    
ai_service = AIService()