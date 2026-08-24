"""Shared AirAware agent logic: env loading and the model call.

Used by both the terminal entry point (first_spark.py) and the web API
(app.py) so the two never drift apart.
"""

import json
import os
import urllib.request
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent / ".env"

SYSTEM_PROMPT = """You are AirAware, a friendly and practical outdoor-planning assistant \
for Christy. You help her decide if conditions are good for her planned activity, how to \
prepare, or if a better time exists. Always answer in two sentences max, using plain \
language. Never invent data; if you don't know conditions, say so. When she gives a plan, \
acknowledge the activity, place, date, and time range, then give a clear recommendation."""


def load_env(path: Path = ENV_PATH) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip()
        if key and key not in os.environ:
            os.environ[key] = value


def get_credentials():
    load_env()
    api_key = os.environ.get("LANTR_AI_KEY")
    api_url = os.environ.get("LANTR_AI_URL")
    model = os.environ.get("LANTR_MODEL")
    missing = [
        name
        for name, value in [
            ("LANTR_AI_KEY", api_key),
            ("LANTR_AI_URL", api_url),
            ("LANTR_MODEL", model),
        ]
        if not value
    ]
    return api_key, api_url, model, missing


def ask_model(plan: str, api_key: str, api_url: str, model: str) -> str:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": plan},
        ],
    }
    request = urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    with urllib.request.urlopen(request) as response:
        body = json.loads(response.read().decode("utf-8"))
    return body["choices"][0]["message"]["content"].strip()
