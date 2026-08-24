"""AirAware web API: the same agent as first_spark.py, over HTTP.

GET  /         -> status message, to confirm the service is alive
POST /message  -> {"message": "..."} -> {"reply": "..."}
"""

from fastapi import FastAPI
from pydantic import BaseModel

from agent import ask_model, get_credentials

app = FastAPI()


class MessageRequest(BaseModel):
    message: str


class MessageResponse(BaseModel):
    reply: str


@app.get("/")
def status() -> dict:
    return {"status": "AirAware agent is running."}


@app.post("/message", response_model=MessageResponse)
def message(request: MessageRequest) -> MessageResponse:
    api_key, api_url, model, missing = get_credentials()
    if missing:
        return MessageResponse(reply=f"Missing from backend/.env: {', '.join(missing)}")

    reply = ask_model(request.message, api_key, api_url, model)
    return MessageResponse(reply=reply)
