from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.core.security import verify_token
from app.core.exceptions import UnauthorizedException
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException()
        user_id_int = int(user_id)
    except Exception:
        raise UnauthorizedException()
        
    user = db.query(User).filter(User.id == user_id_int).first()
    if not user:
        raise UnauthorizedException()
    if not user.is_active:
        raise UnauthorizedException("Inactive user")
    return user
