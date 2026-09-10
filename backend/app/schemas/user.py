from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100, description="User's display name")


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100, description="Password must be at least 8 characters")
    password_confirm: str = Field(..., min_length=8, max_length=100, description="Confirmation password")

    @model_validator(mode="after")
    def check_passwords_match(self) -> "UserCreate":
        if self.password != self.password_confirm:
            raise ValueError("Passwords do not match")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=100)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)


class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
    new_password_confirm: str = Field(..., min_length=8, max_length=100)

    @model_validator(mode="after")
    def check_passwords_match(self) -> "UserPasswordUpdate":
        if self.new_password != self.new_password_confirm:
            raise ValueError("New passwords do not match")
        return self


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
