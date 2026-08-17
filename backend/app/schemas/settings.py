from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ClassBase(BaseModel):
    name: str
    display_order: int

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    display_order: Optional[int] = None

class ClassResponse(ClassBase):
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class BoardBase(BaseModel):
    name: str

class BoardCreate(BoardBase):
    pass

class BoardUpdate(BaseModel):
    name: Optional[str] = None

class BoardResponse(BoardBase):
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ModeBase(BaseModel):
    name: str

class ModeCreate(ModeBase):
    pass

class ModeUpdate(BaseModel):
    name: Optional[str] = None

class ModeResponse(ModeBase):
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SubjectBase(BaseModel):
    name: str

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None

class SubjectResponse(SubjectBase):
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ClassSubjectUpdate(BaseModel):
    subject_ids: List[int]
