from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.user import (
    UserCreate,
    UserLogin,
    UserUpdate,
    UserPasswordUpdate,
    UserResponse,
    Token
)
from backend.app.services.auth_service import auth_service
from backend.app.routers.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new private account with email, name, and hashed password."""
    user = auth_service.register_user(db, user_in)
    access_token = auth_service.create_user_token(user)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password, returning signed JWT."""
    user = auth_service.authenticate_user(db, login_in.email, login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_user_token(user)
    return Token(access_token=access_token, token_type="bearer", user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_current_profile(current_user: User = Depends(get_current_user)):
    """Retrieve profile data for the currently authenticated user."""
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    update_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile information (such as display name)."""
    updated_user = auth_service.update_profile(db, current_user, update_in)
    return UserResponse.model_validate(updated_user)


@router.put("/password")
def change_password(
    pwd_in: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change account password with verification of current password."""
    auth_service.update_password(db, current_user, pwd_in)
    return {"message": "Password updated successfully."}
