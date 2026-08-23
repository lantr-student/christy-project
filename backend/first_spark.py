"""First Spark: a tiny terminal agent for AirAware.

Takes one outdoor plan typed by Christy, sends it to the model, and prints
a short first recommendation. No tools, no cloud setup, terminal only.
"""

import json
import os
import urllib.request
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent / ".env"

SYSTEM_PROMPT = """You are AirAware's planning assistant. Christy will describe one \
outdoor plan in a single chat message, including the activity, location, date, and \
time range. Give a first recommendation only, not a full analysis. Reply in at most \
two sentences.

# --- Paste additional instructions here ---
"""


def load_env(path: Path) -> None:
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


def main() -> None:
    load_env(ENV_PATH)

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
    if missing:
        print(f"Missing from backend/.env: {', '.join(missing)}")
        return

    plan = input("Describe your outdoor plan: ").strip()
    if not plan:
        print("No plan entered.")
        return

    reply = ask_model(plan, api_key, api_url, model)
    print(reply)


if __name__ == "__main__":
    main()
