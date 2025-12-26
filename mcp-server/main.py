from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

app = FastAPI()

class ActionRequest(BaseModel):
    action: str
    data: dict = {}

@app.post("/execute")
async def execute_action(req: ActionRequest):
    # Lumo privacy check: block PII
    if any(k in str(req.data).lower() for k in ['ssn','credit_card','password']):
        raise HTTPException(403, "PII blocked")
    
    # Execute safe automation actions
    if req.action == "inventory_search":
        return {"status": "success", "items": []}
    elif req.action == "product_design":
        return {"status": "success", "design_id": "draft_001"}
    elif req.action == "shipper_lookup":
        return {"status": "success", "shippers": []}
    
    return {"status": "unknown_action"}

@app.get("/health")
async def health():
    return {"status": "healthy", "lumo_protected": True}
