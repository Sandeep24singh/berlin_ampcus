import io
import logging
import os
from functools import lru_cache
from typing import Any

import requests
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field
from PIL import Image
from transformers import pipeline


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("clean-stream-ml")

TOXIC_MODEL_NAME = os.getenv("TOXIC_MODEL_NAME", "unitary/toxic-bert")
NSFW_MODEL_NAME = os.getenv("NSFW_MODEL_NAME", "Falconsai/nsfw_image_detection")
REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT_SECONDS", "10"))

TOXIC_FLAG_THRESHOLD = 0.7
TOXIC_REVIEW_THRESHOLD = 0.4
NSFW_FLAG_THRESHOLD = 0.6
NSFW_REVIEW_THRESHOLD = 0.4

MISINFORMATION_KEYWORDS = {
    "fake cure": 0.8,
    "miracle drug": 0.78,
    "secret government coverup": 0.7,
    "guaranteed vaccine injury": 0.76,
    "doctors hate this": 0.58,
    "instant cancer cure": 0.84,
    "underground remedy": 0.55,
}


class TextModerationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class ImageModerationRequest(BaseModel):
    image_url: str = Field(..., min_length=1)


class ModerationResponse(BaseModel):
    is_flagged: bool
    confidence_score: float
    flag_reasons: list[str]
    score_breakdown: dict[str, float]
    notes: list[str] = []


@lru_cache(maxsize=1)
def get_text_pipeline():
    return pipeline("text-classification", model=TOXIC_MODEL_NAME, truncation=True)


@lru_cache(maxsize=1)
def get_image_pipeline():
    return pipeline("image-classification", model=NSFW_MODEL_NAME)


def clamp_score(value: float) -> float:
    return max(0.0, min(1.0, round(value, 4)))


def extract_toxicity_score(result: list[dict[str, Any]]) -> float:
    if not result:
        return 0.0

    label_map = {item["label"].lower(): float(item["score"]) for item in result}

    if "toxic" in label_map:
        return clamp_score(label_map["toxic"])

    if "non-toxic" in label_map:
        return clamp_score(1 - label_map["non-toxic"])

    return clamp_score(max(label_map.values()))


def misinformation_score(text: str) -> tuple[float, list[str]]:
    normalized = text.lower()
    matched = [
        (keyword, score)
        for keyword, score in MISINFORMATION_KEYWORDS.items()
        if keyword in normalized
    ]

    if not matched:
        return 0.0, []

    score = max(item[1] for item in matched)
    reasons = [f"MISINFORMATION:{item[0]}" for item in matched]
    return clamp_score(score), reasons


def label_to_nsfw_score(result: list[dict[str, Any]]) -> float:
    if not result:
        return 0.0

    high_risk_labels = {"nsfw", "porn", "hentai", "sexy", "explicit"}
    safe_labels = {"safe", "neutral", "drawings"}

    nsfw_score = 0.0
    for item in result:
        label = item["label"].lower()
        score = float(item["score"])
        if any(token in label for token in high_risk_labels):
            nsfw_score = max(nsfw_score, score)
        if any(token in label for token in safe_labels):
            nsfw_score = max(nsfw_score, 1 - score if score > 0.5 else 0.0)

    if nsfw_score == 0.0:
        nsfw_score = max(float(item["score"]) for item in result if item["label"])

    return clamp_score(nsfw_score)


def load_image_from_url(image_url: str) -> Image.Image:
    try:
        response = requests.get(image_url, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Unable to load image URL: {exc}") from exc


def moderate_text_logic(text: str) -> ModerationResponse:
    """
    Input:
    - {"text": "<user text>"}

    Output:
    - {
        "is_flagged": true|false,
        "confidence_score": 0.0-1.0,
        "flag_reasons": ["TOXIC", "MISINFORMATION"],
        "score_breakdown": {
          "toxicity": 0.82,
          "misinformation": 0.78
        },
        "notes": ["Potential sarcasm or contextual ambiguity may affect this score."]
      }

    Confidence thresholds:
    - Toxicity >= 0.7 should be flagged.
    - Toxicity between 0.4 and 0.7 should be escalated for human review.
    - Heuristic misinformation >= 0.4 should be escalated for review.

    Failure cases and limitations:
    - Sarcasm may be misclassified as harmful or safe because tone is hard to infer.
    - Context ambiguity can reduce reliability for quoted or reclaimed language.
    - Cultural bias may affect toxicity judgments across dialects and identity-linked terms.
    """
    notes = [
        "Potential sarcasm or contextual ambiguity may affect this score.",
        "Model confidence can drift on dialect-heavy or culturally specific language.",
    ]

    try:
        classifier = get_text_pipeline()
        prediction = classifier(text)
        if isinstance(prediction, dict):
            prediction = [prediction]
        toxic_score = extract_toxicity_score(prediction)
    except Exception as exc:
        logger.exception("Text model inference failed: %s", exc)
        toxic_score = 0.0
        notes.append("Text model unavailable; response was produced with heuristic fallback.")

    misinformation, misinformation_reasons = misinformation_score(text)

    reasons = []
    if toxic_score >= TOXIC_REVIEW_THRESHOLD:
        reasons.append("TOXIC")
    if misinformation >= TOXIC_REVIEW_THRESHOLD:
        reasons.append("MISINFORMATION")
        reasons.extend(misinformation_reasons)

    confidence = clamp_score(max(toxic_score, misinformation))
    is_flagged = confidence >= TOXIC_REVIEW_THRESHOLD

    return ModerationResponse(
        is_flagged=is_flagged,
        confidence_score=confidence,
        flag_reasons=reasons,
        score_breakdown={
            "toxicity": toxic_score,
            "misinformation": misinformation,
        },
        notes=notes,
    )


def moderate_image_logic(image: Image.Image) -> ModerationResponse:
    """
    Input:
    - Multipart file upload named `file`
    - or {"image_url": "<public image url>"}

    Output:
    - {
        "is_flagged": true|false,
        "confidence_score": 0.0-1.0,
        "flag_reasons": ["NSFW"],
        "score_breakdown": {
          "nsfw": 0.81
        },
        "notes": ["Context ambiguity exists for artistic, medical, or educational images."]
      }

    Confidence thresholds:
    - NSFW >= 0.6 should be flagged.
    - NSFW between 0.4 and 0.6 should be escalated for human review.

    Failure cases and limitations:
    - Sarcasm is not relevant here, but meme overlays can obscure image context.
    - Context ambiguity is common for medical, educational, or artistic nudity.
    - Cultural bias can influence what pretrained models interpret as inappropriate.
    """
    notes = [
        "Context ambiguity exists for artistic, medical, or educational images.",
        "Image classifiers can underperform on stylized, low-resolution, or heavily edited content.",
    ]

    try:
        classifier = get_image_pipeline()
        prediction = classifier(image)
        if isinstance(prediction, dict):
            prediction = [prediction]
        nsfw_score = label_to_nsfw_score(prediction)
    except Exception as exc:
        logger.exception("Image model inference failed: %s", exc)
        nsfw_score = 0.0
        notes.append("Image model unavailable; image defaults to safe until human review is triggered elsewhere.")

    reasons = ["NSFW"] if nsfw_score >= NSFW_REVIEW_THRESHOLD else []

    return ModerationResponse(
        is_flagged=nsfw_score >= NSFW_REVIEW_THRESHOLD,
        confidence_score=nsfw_score,
        flag_reasons=reasons,
        score_breakdown={"nsfw": nsfw_score},
        notes=notes,
    )


app = FastAPI(
    title="Clean Stream ML Service",
    description="Moderation microservice for toxic text, misinformation heuristics, and NSFW images.",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/moderate/text", response_model=ModerationResponse)
def moderate_text(payload: TextModerationRequest):
    return moderate_text_logic(payload.text)


@app.post("/moderate/image", response_model=ModerationResponse)
async def moderate_image(file: UploadFile = File(...)):
    try:
        image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {exc}") from exc

    return moderate_image_logic(image)


@app.post("/moderate/image-url", response_model=ModerationResponse)
def moderate_image_url(payload: ImageModerationRequest):
    image = load_image_from_url(payload.image_url)
    return moderate_image_logic(image)
