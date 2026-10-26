from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime
import re
from app.schemas.settings import SubjectResponse

class StudentBase(BaseModel):
    name: str
    class_id: int
    board_id: int
    mode_id: int
    email: EmailStr
    contact_number_1: str
    contact_number_2: Optional[str] = None
    contact_number_3: Optional[str] = None
    remarks: Optional[str] = None

    @field_validator("contact_number_1", "contact_number_2", "contact_number_3")
    @classmethod
    def validate_contact(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if v == "":
                return None
            if not re.match(r"^\d{10}$", v):
                raise ValueError("Contact number must be exactly 10 digits")
        return v

    @field_validator("remarks")
    @classmethod
    def validate_remarks(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() == "":
            return None
        return v

class StudentCreate(StudentBase):
    roll_number: str
    subject_ids: List[int]

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    class_id: Optional[int] = None
    board_id: Optional[int] = None
    mode_id: Optional[int] = None
    email: Optional[EmailStr] = None
    contact_number_1: Optional[str] = None
    contact_number_2: Optional[str] = None
    contact_number_3: Optional[str] = None
    remarks: Optional[str] = None
    subject_ids: Optional[List[int]] = None

    @field_validator("contact_number_1", "contact_number_2", "contact_number_3")
    @classmethod
    def validate_contact(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if v == "":
                return None
            if not re.match(r"^\d{10}$", v):
                raise ValueError("Contact number must be exactly 10 digits")
        return v

    @field_validator("remarks")
    @classmethod
    def validate_remarks(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip() == "":
            return None
        return v

class StudentResponse(StudentBase):
    id: int
    roll_number: str
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    class_name: Optional[str] = None
    board_name: Optional[str] = None
    mode_name: Optional[str] = None
    subjects: List[SubjectResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class StudentListResponse(BaseModel):
    id: int
    roll_number: str
    name: str
    email: str
    contact_number_1: str
    class_name: str
    board_name: str
    mode_name: str
    is_archived: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
