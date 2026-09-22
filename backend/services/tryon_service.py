"""Virtual Try-On generation service.

Renders ONE composite image of the logged-in user wearing every garment
currently in their shopping cart, guided by their profile metrics
(height / body type / gender).

Providers (TRYON_PROVIDER in backend/.env):

- "gemini":       default. Identity-preserving multimodal render: the stored
                  reference photo is downloaded and attached to the request as
                  a real image input (first image part), followed by the
                  garment photos.
- "huggingface":  optional FREE fallback built on black-forest-labs/
                  FLUX.1-schnell via the Hugging Face Inference Providers router.

IMPORTANT LIMITATION (huggingface provider)
    FLUX.1-schnell is pure TEXT-TO-IMAGE. The reference photo cannot be sent
    through this API, so the output is an OUTFIT INSPIRATION rendering of the
    cart styled for the user's profile — NOT an identity-preserving garment
    transfer. It does not preserve the shopper's face and may not reproduce
    every product detail exactly. The reference photo remains stored in S3 so
    a real VTON/image-editing provider can be plugged in later.
"""


import logging
import os
import httpx
from pydantic import BaseModel

from services.s3_service import upload_image

logger = logging.getLogger(__name__)

DOWNLOAD_TIMEOUT_S = 30
HF_TIMEOUT_S = 120
# Wavespeed runs tasks asynchronously; cap the total polling window per request.
WAVESPEED_POLL_INTERVAL_S = 0.5
WAVESPEED_MAX_POLLS = 90

# FIX 1: Valid Gemini model string
DEFAULT_IMAGE_MODEL = "gemini-3.6-flash"
DEFAULT_HF_MODEL = "black-forest-labs/FLUX.1-schnell"

# Keyword map used to resolve a product's outfit slot from its category
# ancestor chain (slug/name at any level) and its own name.
SLOT_KEYWORDS = {
    "Topwear": (
        "topwear", "tshirt", "t-shirt", "shirt", "tee", "jacket", "hoodie",
        "sweatshirt", "sweater", "kurta", "kurti", "blazer", "cardigan",
        "pullover", "tank", "polo", "top",
    ),
    "Bottomwear": (
        "bottomwear", "pant", "trouser", "jean", "short", "jogger",
        "legging", "skirt", "chino", "track", "saree",
    ),
    "Footwear": (
        "footwear", "shoe", "sneaker", "boot", "sandal", "flip",
        "slipper", "loafer", "heel", "trainer",
    ),
}


class _PromptBrief(BaseModel):
    """Response schema for the optional Gemini prompt-refinement call."""

    visual_description: str


def resolve_category_slot(product) -> str:
    tokens = []
    category = getattr(product, "category", None)
    while category is not None:
        tokens.extend([category.slug or "", category.name or ""])
        category = getattr(category, "parent", None)

    tokens.append(product.name or "")
    haystack = " ".join(tokens).lower()

    for slot, keywords in SLOT_KEYWORDS.items():
        if any(keyword in haystack for keyword in keywords):
            return slot
    return "Other"


def build_payload(reference_image_url: str, cart_items) -> dict:
    pipeline_items = []
    outfit_items = []

    for cart_item in cart_items:
        product = cart_item.product
        metadata = getattr(product, "product_metadata", None)
        slot = resolve_category_slot(product)
        quantity = cart_item.quantity or 1

        pipeline_items.append({
            "name": product.name,
            "category_slug": slot.lower(),
            "image_url": product.image_url,
            "brand": product.brand,
            "color": getattr(metadata, "color", None),
            "material": getattr(metadata, "material", None),
            "pattern": getattr(metadata, "pattern", None),
            "fit_type": getattr(metadata, "fit_type", None),
            "style": getattr(metadata, "style", None),
            "occasion": getattr(metadata, "occasion", None),
            "quantity": quantity,
        })

        outfit_items.append({
            "product_id": product.id,
            "name": product.name,
            "image_url": product.image_url,
            "price": (
                product.discount_price
                if product.discount_price is not None
                else product.price
            ),
            "category_slot": slot,
            "size_name": cart_item.size.name if cart_item.size else None,
            "quantity": quantity,
        })

    return {
        "user_photo_url": reference_image_url,
        "cart_items": pipeline_items,
        "outfit_items": outfit_items,
    }


def _metrics_facts(user_metrics: dict | None) -> str:
    metrics = user_metrics or {}
    gender = metrics.get("gender") or "person"
    height_cm = metrics.get("height_cm")
    body_type = metrics.get("body_type") or "Regular"
    height = f"{height_cm} cm tall" if height_cm else "average height"
    return f"{gender}, {height}, with a {body_type} body type"


def _garment_lines(cart_items: list[dict]) -> str:
    grouped: dict[str, list[str]] = {}
    for item in cart_items:
        bits = [f"  - {item.get('name', 'Unnamed item')}"]
        if item.get("brand"):
            bits.append(f"brand {item['brand']}")
        if item.get("color"):
            bits.append(f"color: {item['color']}")
        if item.get("material"):
            bits.append(f"material: {item['material']}")
        if item.get("pattern"):
            bits.append(f"pattern: {item['pattern']}")
        if item.get("fit_type"):
            bits.append(f"{item['fit_type']} fit")
        if item.get("style"):
            bits.append(f"style: {item['style']}")
        occasion = item.get("occasion")
        # Occasion is a multi-select array in product metadata.
        if isinstance(occasion, (list, tuple)) and occasion:
            bits.append("occasion: " + ", ".join(str(o) for o in occasion))
        elif occasion:
            bits.append(f"occasion: {occasion}")
        grouped.setdefault(item.get("category_slug", "other"), []).append(
            ", ".join(bits)
        )

    slot_titles = {
        "topwear": "TOP(S):",
        "bottomwear": "BOTTOM(S):",
        "footwear": "FOOTWEAR:",
        "other": "OTHER:",
    }

    lines = []
    for slug, title in slot_titles.items():
        if slug in grouped:
            lines.append(title)
            lines.extend(grouped[slug])
    return "\n".join(lines)


# Prepended ONLY on the Gemini (multimodal) path, where the customer's photo
# and garment flat-lays are attached. FLUX.1-schnell cannot receive images,
# so this identity language must never leak into the text-to-image brief.
GEMINI_IDENTITY_INSTRUCTIONS = (
    "You are a virtual try-on stylist AI. The FIRST image provided is a "
    "photo of the customer; any further images are flat-lay product "
    "photos of the garments they have in their shopping cart.\n"
    "- Keep the customer's face, hair and identity consistent with the "
    "first image.\n\n"
)


def build_tryon_prompt(cart_items: list[dict], user_metrics: dict | None) -> str:
    """Build ONE strong text-to-image outfit brief from existing data.

    Deliberately provider-neutral and honest: it describes the person via
    profile metrics and the outfit via cart product details. It makes NO
    claim about preserving the shopper's face or exact garments — for
    FLUX.1-schnell this is an outfit-inspiration visualization.
    """
    facts = _metrics_facts(user_metrics)
    garments = _garment_lines(cart_items) or "  - (unspecified outfit)"

    return (
        "Photorealistic full-body fashion catalogue photograph, portrait "
        "orientation, for an online clothing store lookbook.\n\n"
        f"The customer is a {facts}.\n"
        "They are previewing their ENTIRE shopping cart worn together as "
        "one complete outfit:\n"
        f"{garments}\n\n"
        "Requirements:\n"
        "- Dress the person in ALL the listed garments together; each "
        "garment must keep its own color, material, pattern and cut as "
        "described above.\n"
        "- Match the drape and silhouette to their height and body type so "
        "the fit looks natural, not photoshopped.\n"
        "- Feet fully in frame with the listed footwear clearly visible; if "
        "no footwear is listed, add tasteful minimal shoes that match the "
        "outfit's style.\n"
        "- Full-body, front-facing pose, plain light studio background, "
        "soft studio lighting.\n"
        "- Fashion-catalogue quality. No text, no watermark, no extra "
        "people."
    )


def _refine_prompt_with_gemini(
    base_prompt: str,
    cart_items: list[dict],
    user_metrics: dict | None,
) -> str | None:
    if not os.getenv("GEMINI_API_KEY"):
        return None
    if os.getenv("TRYON_GEMINI_PROMPT_BUILDER", "1") == "0":
        return None

    from services import gemini_service

    instruction = (
        "Rewrite the following virtual try-on brief as ONE vivid, "
        "photorealistic visual description of the final composite render. "
        "Keep every garment, color, fit detail and body metric exactly as "
        "stated — do not add, remove or substitute items.\n\n" + base_prompt
    )

    try:
        brief = gemini_service.generate_structured(instruction, _PromptBrief)
        description = getattr(brief, "visual_description", None)
        if isinstance(description, str) and len(description) > 80:
            return description
    except Exception:
        return None
    return None


def _download_image(url: str) -> tuple[bytes, str]:
    response = httpx.get(url, timeout=DOWNLOAD_TIMEOUT_S, follow_redirects=True)
    response.raise_for_status()
    mime = response.headers.get("content-type", "image/jpeg").split(";")[0]
    return response.content, mime


def _collect_garment_images(cart_items: list[dict], max_images: int = 3):
    images = []
    for item in cart_items:
        url = item.get("image_url")
        if not url:
            continue
        try:
            images.append(_download_image(url))
        except Exception:
            continue
        if len(images) >= max_images:
            break
    return images


def _generate_with_gemini(
    prompt: str,
    user_photo_bytes: bytes,
    user_photo_mime: str,
    garment_images: list[tuple[bytes, str]],
) -> bytes:
    from google import genai
    from google.genai import types

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured in backend/.env")

    client = genai.Client(api_key=api_key)
    model = os.getenv("TRYON_IMAGE_MODEL", "gemini-2.5-flash")

    contents: list = [types.Part(text=prompt)]
    contents.append(
        types.Part.from_bytes(data=user_photo_bytes, mime_type=user_photo_mime)
    )
    for image_bytes, mime in garment_images:
        contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime))

    # Prove (in logs) that the request actually carries image inputs. Only
    # counts/sizes are logged — never image data, URLs or credentials.
    attached_images = [
        part for part in contents if getattr(part, "inline_data", None) is not None
    ]
    logger.info(
        "Try-On Gemini request ready: model=%s, image input parts=%d "
        "(first image = user reference photo, plus %d garment photo(s)) "
        "among %d content part(s).",
        model,
        len(attached_images),
        max(len(attached_images) - 1, 0),
        len(contents),
    )

    # Standard multimodal call with explicit image response modality
    response = client.models.generate_content(
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )

    if response.candidates and response.candidates[0].content:
        for part in response.candidates[0].content.parts:
            if getattr(part, "inline_data", None) is not None:
                return part.inline_data.data

    raise RuntimeError("Gemini model returned response without image data payload.")


# ---------------------------------------------------------------------------
# Hugging Face provider (FREE dev fallback)
#
# black-forest-labs/FLUX.1-schnell is no longer served by hf-inference's legacy
# api-inference endpoint; today it is live on third-party Inference Providers
# reachable through the Hugging Face Router with the SAME HF token. The token
# stays server-side in backend/.env (HUGGINGFACEHUB_API_TOKEN).
#
# Primary   : nscale    - synchronous, OpenAI-style /v1/images/generations,
#                         returns base64 JSON.
# Fallback  : wavespeed - async task API behind the router (submit + poll).
# fal-ai    : rejects FLUX.1-schnell ("Model not supported"), so it is skipped.
# ---------------------------------------------------------------------------

_HF_ROUTER_BASE = "https://router.huggingface.co"
_NSCALE_T2I_URL = f"{_HF_ROUTER_BASE}/nscale/v1/images/generations"
_WAVESPEED_T2I_URL = f"{_HF_ROUTER_BASE}/wavespeed/api/v3/wavespeed-ai/flux-schnell"

# Portrait 3:4 so full-body shots keep the feet/footwear in frame.
_HF_IMAGE_WIDTH = 768
_HF_IMAGE_HEIGHT = 1024


def _hf_error_message(status_code: int) -> str:
    """Map a Hugging Face/router HTTP status to a readable, safe message."""
    known = {
        401: "Invalid or expired Hugging Face token "
             "(check HUGGINGFACEHUB_API_TOKEN in backend/.env)",
        403: "This Hugging Face token lacks inference permission "
             "(enable 'Inference Providers' scope on the token)",
        404: "Try-On model/provider unavailable on Hugging Face "
             "(model not served by any inference provider right now)",
        429: "Hugging Face quota/rate limit reached "
             "(monthly inference credits exhausted or too many requests)",
    }
    if status_code in known:
        return f"Hugging Face inference error {status_code}: {known[status_code]}"
    if 500 <= status_code < 600:
        return (
            f"Hugging Face inference error {status_code}: the selected "
            "inference provider failed to serve the request"
        )
    return (
        f"Hugging Face inference error {status_code}: unexpected response "
        "from the inference router"
    )


def _generate_with_huggingface(prompt: str) -> bytes:
    """Text-to-image generation of the outfit brief via Hugging Face.

    Tries nscale first and falls back to wavespeed-on-router for resilience.
    NOTE: this is an OUTFIT VISUALIZATION only — FLUX.1-schnell receives text
    exclusively; neither the reference photo nor exact garments are transferred.
    """
    token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
    if not token:
        raise RuntimeError(
            "HUGGINGFACEHUB_API_TOKEN is not configured in backend/.env"
        )

    model = os.getenv("TRYON_HF_MODEL", DEFAULT_HF_MODEL).strip()
    headers = {"Authorization": f"Bearer {token}"}

    failures: list[str] = []
    generators = [
        ("nscale", lambda: _hf_image_from_nscale(prompt, model, headers)),
    ]
    # The wavespeed route is registered specifically for FLUX.1-schnell;
    # other models would 400 there, so the fallback only applies to it.
    if model.lower() == DEFAULT_HF_MODEL.lower():
        generators.append(
            ("wavespeed", lambda: _hf_image_from_wavespeed(prompt, headers)),
        )

    for provider_name, generator in generators:
        try:
            return generator()
        except httpx.HTTPError as exc:
            failures.append(
                f"provider '{provider_name}' unreachable ({exc.__class__.__name__})"
            )
        except RuntimeError as exc:
            failures.append(str(exc))
        except Exception as exc:  # provider boundary: never leak raw internals
            failures.append(
                f"provider '{provider_name}' failed "
                f"({exc.__class__.__name__})"
            )

    raise RuntimeError(
        "Try-On could not generate an image on Hugging Face — "
        + "; ".join(failures)
    )


def _hf_image_from_nscale(prompt: str, model: str, headers: dict) -> bytes:
    """Generate via nscale through the HF router; returns raw image bytes."""
    import base64

    response = httpx.post(
        _NSCALE_T2I_URL,
        headers=headers,
        json={
            "model": model,
            "prompt": prompt,
            "response_format": "b64_json",
            "size": f"{_HF_IMAGE_WIDTH}x{_HF_IMAGE_HEIGHT}",
        },
        timeout=HF_TIMEOUT_S,
    )
    if response.status_code != 200:
        raise RuntimeError(_hf_error_message(response.status_code))

    try:
        b64_payload = response.json()["data"][0]["b64_json"]
    except (ValueError, KeyError, IndexError) as exc:
        raise RuntimeError(
            "Hugging Face inference returned an unreadable response from nscale."
        ) from exc

    return base64.b64decode(b64_payload)


def _hf_image_from_wavespeed(prompt: str, headers: dict) -> bytes:
    """Generate via wavespeed through the HF router (submit then poll)."""
    import time

    submit = httpx.post(
        _WAVESPEED_T2I_URL,
        headers=headers,
        json={
            "prompt": prompt,
            "width": _HF_IMAGE_WIDTH,
            "height": _HF_IMAGE_HEIGHT,
        },
        timeout=HF_TIMEOUT_S,
    )
    if submit.status_code != 200:
        raise RuntimeError(_hf_error_message(submit.status_code))

    try:
        poll_url = (
            submit.json()["data"]["urls"]["get"]
            .replace("https://api.wavespeed.ai/", f"{_HF_ROUTER_BASE}/wavespeed/")
        )
    except (ValueError, KeyError, TypeError) as exc:
        raise RuntimeError(
            "Hugging Face inference returned an unreadable task response "
            "from wavespeed."
        ) from exc

    for _ in range(WAVESPEED_MAX_POLLS):
        time.sleep(WAVESPEED_POLL_INTERVAL_S)
        polled = httpx.get(poll_url, headers=headers, timeout=DOWNLOAD_TIMEOUT_S)
        if polled.status_code != 200:
            raise RuntimeError(_hf_error_message(polled.status_code))
        status = polled.json().get("data", {}).get("status")
        if status == "completed":
            outputs = polled.json()["data"].get("outputs") or []
            if not outputs:
                raise RuntimeError(
                    "Hugging Face inference finished without an output image."
                )
            download = httpx.get(
                outputs[0],
                timeout=DOWNLOAD_TIMEOUT_S,
                follow_redirects=True,
            )
            if download.status_code != 200:
                raise RuntimeError(_hf_error_message(download.status_code))
            return download.content
        if status == "failed":
            raise RuntimeError(
                "Hugging Face inference failed: wavespeed reported the "
                "generation task as failed."
            )
    raise RuntimeError(
        "Hugging Face inference timed out while waiting for the wavespeed "
        "generation task to finish."
    )


def generate_tryon(
    user_photo_url: str,
    cart_items: list[dict],
    user_metrics: dict | None,
) -> str:
    prompt = build_tryon_prompt(cart_items, user_metrics)
    
    # FIX 3: Catch prompt builder errors gracefully
    refined_prompt = _refine_prompt_with_gemini(prompt, cart_items, user_metrics)
    if refined_prompt:
        prompt = refined_prompt

    provider = os.getenv("TRYON_PROVIDER", "gemini").lower()
    logger.info(
        "Try-On generation starting: provider=%s, reference_photo_present=%s",
        provider,
        bool(user_photo_url),
    )

    try:
        if provider == "huggingface":
            # Text-to-image only: this provider cannot receive the reference
            # photo as an image input at all (see module docstring).
            logger.info(
                "Try-On provider 'huggingface' receives the text prompt only; "
                "the reference photo cannot be sent as an image input here."
            )
            image_bytes = _generate_with_huggingface(prompt)
        else:
            user_photo_bytes, user_photo_mime = _download_image(user_photo_url)
            garment_images = _collect_garment_images(cart_items)
            logger.info(
                "Try-On reference photo retrieved as image input "
                "(mime=%s, %d bytes) plus %d garment image(s) downloaded.",
                user_photo_mime,
                len(user_photo_bytes),
                len(garment_images),
            )
            image_bytes = _generate_with_gemini(
                # Re-attach the reference-photo identity directives; the neutral
                # brief above never claims identity/garment preservation.
                GEMINI_IDENTITY_INSTRUCTIONS + prompt,
                user_photo_bytes,
                user_photo_mime,
                garment_images,
            )
    except Exception:
        logger.exception("Try-On generation failed on provider '%s'.", provider)
        raise

    result_url = upload_image(image_bytes, "try-on.png", "image/png", folder="try-ons")
    logger.info(
        "Try-On generation succeeded: result rendered (%d bytes) and uploaded.",
        len(image_bytes),
    )
    return result_url