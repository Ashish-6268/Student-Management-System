from pydantic import BaseModel
from typing import Any, List, Optional

class ResponseBase(BaseModel):
    success: bool = True
    message: str = ""
    data: Any = None

class PaginatedResponse(BaseModel):
    success: bool = True
    data: List[Any] = []
    meta: dict = {}
