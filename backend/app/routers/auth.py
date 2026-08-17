from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.services.auth_service import auth_service
from app.schemas.auth import TokenResponse, UserResponse
from app.schemas.common import ResponseBase

router = APIRouter()

@router.post("/login", response_model=ResponseBase)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    token = auth_service.create_token_for_user(user)
    return ResponseBase(success=True, message="Login successful", data=token)

@router.get("/me", response_model=ResponseBase)
def get_me(current_user = Depends(get_current_user)):
    return ResponseBase(success=True, data=UserResponse.model_validate(current_user))
