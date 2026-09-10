import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set testing environment variables before importing app
os.environ["ENVIRONMENT"] = "testing"
os.environ["SECRET_KEY"] = "test-secret-key-for-pytest-execution"

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.models.user import User
from backend.app.utils.security import get_password_hash, create_access_token

# In-memory SQLite with StaticPool for thread-safe test isolation
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    """Provides a fresh transactional database session per test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db):
    """Provides a TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db):
    """Creates a standard test user."""
    user = User(
        name="Sarah Connor",
        email="sarah@example.com",
        password_hash=get_password_hash("Password123!"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_token(test_user):
    """Returns JWT bearer token for the test user."""
    token = create_access_token({"sub": str(test_user.id), "email": test_user.email, "name": test_user.name})
    return token


@pytest.fixture
def auth_headers(test_user_token):
    return {"Authorization": f"Bearer {test_user_token}"}


@pytest.fixture
def second_user(db):
    """Creates a second user for cross-user security tests."""
    user = User(
        name="John Doe",
        email="john@example.com",
        password_hash=get_password_hash("Secret456!"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def second_user_headers(second_user):
    token = create_access_token({"sub": str(second_user.id), "email": second_user.email, "name": second_user.name})
    return {"Authorization": f"Bearer {token}"}
