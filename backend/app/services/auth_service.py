from sqlalchemy.orm import Session
from app.repositories.user_repository import user_repo
from app.core.security import verify_password, create_access_token
from app.core.exceptions import UnauthorizedException
from app.schemas.auth import TokenResponse

class AuthService:
    def authenticate_user(self, db: Session, email: str, password: str):
        user = user_repo.get_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Incorrect email or password")
        if not user.is_active:
            raise UnauthorizedException("Inactive user")
        return user

    def create_token_for_user(self, user) -> TokenResponse:
        access_token = create_access_token(data={"sub": str(user.id)})
        return TokenResponse(access_token=access_token, token_type="bearer")

auth_service = AuthService()
