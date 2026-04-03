import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import json
from main import app, get_groq_client

# --- Mock Groq Responses ---
@pytest.fixture
def make_mock_groq_client(response_dict: dict):
    mock_client = MagicMock()
    mock_message = MagicMock()
    mock_message.content = json.dumps(response_dict)
    mock_client.chat.completions.create.return_value.choices[0].message = mock_message
    return mock_client

# --- Mock Response Fixtures ---
@pytest.fixture
def mock_profile_response():
    return {
        "Firstname": "John",
        "Lastname": "Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "location": "Berlin, Germany",
        "linkedin": "linkedin.com/in/johndoe",
        "IndustryPortfolio": "",
        "PhDPortfolio": ""
    }

@pytest.fixture
def mock_cover_letter_response():
    return {
        "recipientName": "Hiring Manager",
        "recipientTitle": "Engineering Lead",
        "companyName": "Acme Corp",
        "date": "2024-01-01",
        "greeting": "Dear Hiring Manager,",
        "paragraphs": ["Opening...", "Body...", "Closing..."],
        "signOff": "Sincerely,"
    }

@pytest.fixture
def mock_tailored_resume_response():
    return {
        "summary": "Experienced engineer...",
        "researchInterests": ["AI", "ML"],
        "experience": [
            {
                "role": "Engineer",
                "company": "Acme",
                "date": "01/2020 - 01/2023",
                "location": "Berlin",
                "achievements": ["Built X", "Improved Y"]
            }
        ],
        "education": [],
        "skills": [],
        "publications": [],
        "projects": [],
        "Languages": [],
        "certifications": []
    }

# --- Authenticated Client Fixture ---
@pytest.fixture
def client():
    """Client with valid API key"""
    with patch.dict("os.environ", {"INTERNAL_API_KEY": "test-secret"}):
        def override_groq():
            return MagicMock()
        app.dependency_overrides[get_groq_client] = override_groq
        with TestClient(app) as c:
            c.headers.update({"X-API-Key": "test-secret"})
            yield c
        app.dependency_overrides.clear()

@pytest.fixture
def unauth_client():
    """Client with no API key"""
    with TestClient(app) as c:
        yield c