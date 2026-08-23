"""Server-side Gemini AI wrappers.

All AI calls run from FastAPI with a backend-only API key (backend/.env
GEMINI_API_KEY) — the key is never exposed to the React frontend.

Generation is expensive and rate-limited. Callers must:
  - gate on explicit user actions (never on page load),
  - never loop generation in automated tests (use exactly one controlled call).

The model is configurable via GEMINI_IMAGE_MODEL so it can be swapped without
touching code.
"""

import os

from google import genai
from google.genai import types

DEFAULT_IMAGE_MODEL = "gemini-3.1-flash-image"
# Text model for fast structured JSON inference (Find Your Look intent).
DEFAULT_TEXT_MODEL = "gemini-3.6-flash"
# Hard cap for one-shot inference calls so AI can never hang a request.
TEXT_TIMEOUT_MS = 20_000


def _client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured in backend/.env")
    return genai.Client(api_key=api_key)


def _text_model() -> str:
    return os.getenv("GEMINI_TEXT_MODEL", DEFAULT_TEXT_MODEL)


def _image_model() -> str:
    return os.getenv("GEMINI_IMAGE_MODEL", DEFAULT_IMAGE_MODEL)


def build_ai_model_prompt(profile) -> str:
    """Turn a UserProfile row into the image-generation prompt."""
    gender = profile.gender or "person"
    height = f"{profile.height_cm} cm" if profile.height_cm else "average height"
    body = profile.body_type or "Regular"
    fit = profile.preferred_fit or "Regular Fit"
    style = profile.style_preference or "Casual"

    return (
        "You are a fashion stylist AI. Use the reference photo as this person's "
        "identity, then generate ONE photorealistic full-body fashion-model image "
        "of the same person styled in a complete outfit.\n\n"
        f"- Gender: {gender}\n"
        f"- Height: {height}\n"
        f"- Body type: {body}\n"
        f"- Preferred fit: {fit}\n"
        f"- Style preference: {style}\n\n"
        "Requirements:\n"
        "- Keep the face and identity consistent with the reference photo.\n"
        f"- The outfit must match the '{style}' aesthetic and '{fit}' fit.\n"
        "- Plain light studio background, natural lighting, full body, front-facing.\n"
        "- One complete outfit (top and bottom). No text, no watermark, no extra people."
    )


def generate_structured(prompt: str, schema):
    """One-shot structured JSON generation from a text prompt.

    Uses Gemini's native structured-output capability (no free-form prose
    parsing). Returns the parsed object (Pydantic model instance when the
    SDK can hydrate it, otherwise a dict) — callers must still validate.
    Raises on any failure; callers own the fallback strategy.
    """
    client = genai.Client(
        api_key=os.getenv("GEMINI_API_KEY"),
        http_options=types.HttpOptions(timeout=TEXT_TIMEOUT_MS),
    )

    response = client.models.generate_content(
        model=_text_model(),
        contents=[types.Part(text=prompt)],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.2,
        ),
    )

    if getattr(response, "parsed", None) is not None:
        return response.parsed

    # Defensive fallback: some SDK/model combinations only populate .text.
    import json

    return json.loads(response.text)


def generate_ai_model_image(
    reference_image_bytes: bytes,
    reference_mime_type: str,
    profile,
) -> bytes:
    """Call Gemini once to generate the AI model image from the reference photo.

    Returns the raw generated image bytes (PNG). Raises RuntimeError on failure.
    """
    client = _client()

    response = client.models.generate_content(
        model=_image_model(),
        contents=[
            types.Part(text=build_ai_model_prompt(profile)),
            types.Part.from_bytes(
                data=reference_image_bytes,
                mime_type=reference_mime_type,
            ),
        ],
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        ),
    )

    block_reason = None
    if response.prompt_feedback is not None:
        block_reason = response.prompt_feedback.block_reason

    image_part = None
    if response.candidates:
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                image_part = part.inline_data
                break

    if image_part is None:
        raise RuntimeError(
            f"Gemini returned no image (block_reason={block_reason})"
        )

    return image_part.data
