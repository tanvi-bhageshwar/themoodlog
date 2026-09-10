from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserUpdate, UserPasswordUpdate
from backend.app.utils.security import verify_password, get_password_hash, create_access_token


class AuthService:
    """Service handling user registration, authentication, and credential management."""

    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        """Register a new user, ensuring email uniqueness and bcrypt hashing."""
        existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )

        hashed_password = get_password_hash(user_in.password)
        db_user = User(
            name=user_in.name.strip(),
            email=user_in.email.lower().strip(),
            password_hash=hashed_password,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user credentials and return the user object or None."""
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def create_user_token(user: User) -> str:
        """Generate access JWT for an authenticated user."""
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "name": user.name,
        }
        return create_access_token(token_data)

    @staticmethod
    def update_profile(db: Session, user: User, user_in: UserUpdate) -> User:
        """Update profile fields (such as display name)."""
        if user_in.name:
            user.name = user_in.name.strip()
        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_password(db: Session, user: User, password_in: UserPasswordUpdate) -> bool:
        """Verify current password and update with new bcrypt hash."""
        if not verify_password(password_in.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The current password provided is incorrect."
            )

        user.password_hash = get_password_hash(password_in.new_password)
        user.updated_at = datetime.utcnow()
        db.commit()
        return True


auth_service = AuthService()
