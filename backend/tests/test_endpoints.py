import pytest
from unittest.mock import MagicMock
import json
from main import app, get_groq_client

# ---------------------------------------------------------------
# AUTH TESTS
# ---------------------------------------------------------------
class TestAuth:
    def test_blocks_request_with_no_api_key(self, unauth_client):
        response = unauth_client.post("/extract-profile", data={"cv_markdown": "test"})
        assert response.status_code == 401

    def test_blocks_request_with_wrong_api_key(self, unauth_client):
        response = unauth_client.post(
            "/extract-profile",
            data={"cv_markdown": "test"},
            headers={"X-API-Key": "wrong-key"}
        )
        assert response.status_code == 401

    def test_returns_correct_shape(self, client, mock_groq_client, mock_profile_response):
        app.dependency_overrides[get_groq_client] = lambda: mock_groq_client(mock_profile_response)
        response = client.post("/extract-profile", data={"cv_markdown": "test"})
        assert response.status_code != 401


# ---------------------------------------------------------------
# FILE VALIDATION TESTS
# ---------------------------------------------------------------
class TestFileValidation:
    def test_rejects_non_pdf(self, client):
        response = client.post(
            "/convert-to-md",
            files={"file": ("test.txt", b"hello world", "text/plain")}
        )
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]

    def test_rejects_file_too_large(self, client):
        large_file = b"0" * (11 * 1024 * 1024)  # 11MB, over the 10MB limit
        response = client.post(
            "/convert-to-md",
            files={"file": ("large.pdf", large_file, "application/pdf")}
        )
        assert response.status_code == 400
        assert "too large" in response.json()["detail"]

    def test_accepts_valid_pdf_size(self, client):
        small_file = b"0" * (1 * 1024 * 1024)  # 1MB, under the limit
        # Will fail at PDF parsing since it's not real PDF content
        # but should pass the size/type validation (not a 400)
        response = client.post(
            "/convert-to-md",
            files={"file": ("small.pdf", small_file, "application/pdf")}
        )
        assert response.status_code != 400


# ---------------------------------------------------------------
# ENDPOINT SHAPE TESTS
# ---------------------------------------------------------------
class TestExtractProfile:
    def test_returns_correct_shape(self, client, mock_profile_response):
        app.dependency_overrides[get_groq_client] = lambda: make_mock_groq_client(mock_profile_response)
        response = client.post("/extract-profile", data={"cv_markdown": "John Doe, john@example.com"})
        assert response.status_code == 200
        data = response.json()
        assert "Firstname" in data
        assert "Lastname" in data
        assert "email" in data

    def test_returns_empty_strings_for_missing_fields(self, client):
        partial_response = {"Firstname": "John"}  # missing all other fields
        app.dependency_overrides[get_groq_client] = lambda: make_mock_groq_client(partial_response)
        response = client.post("/extract-profile", data={"cv_markdown": "John"})
        assert response.status_code == 200
        data = response.json()
        assert data["Lastname"] == ""
        assert data["email"] == ""


class TestCoverLetter:
    def test_returns_correct_shape(self, client, mock_cover_letter_response):
        app.dependency_overrides[get_groq_client] = lambda: make_mock_groq_client(mock_cover_letter_response)
        response = client.post(
            "/generate-cover-letter",
            data={"cv_markdown": "test cv", "job_description": "test jd"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "recipientName" in data
        assert "paragraphs" in data
        assert isinstance(data["paragraphs"], list)

    def test_paragraphs_is_list(self, client, mock_cover_letter_response):
        app.dependency_overrides[get_groq_client] = lambda: make_mock_groq_client(mock_cover_letter_response)
        response = client.post(
            "/generate-cover-letter",
            data={"cv_markdown": "test cv", "job_description": "test jd"}
        )
        assert isinstance(response.json()["paragraphs"], list)


class TestTailorResume:
    def test_returns_correct_shape(self, client, mock_tailored_resume_response):
        app.dependency_overrides[get_groq_client] = lambda: make_mock_groq_client(mock_tailored_resume_response)
        response = client.post(
            "/tailor-resume",
            data={"cv_markdown": "test cv", "job_description": "test jd"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "tailored_resume" in data
        assert "summary" in data["tailored_resume"]
        assert "experience" in data["tailored_resume"]

    def test_experience_is_list(self, client, mock_tailored_resume_response):
        app.dependency_overrides[get_groq_client] = lambda: make_mock_groq_client(mock_tailored_resume_response)
        response = client.post(
            "/tailor-resume",
            data={"cv_markdown": "test cv", "job_description": "test jd"}
        )
        assert isinstance(response.json()["tailored_resume"]["experience"], list)

    def test_handles_empty_optional_fields(self, client):
        minimal_response = {
            "summary": "Engineer",
            "researchInterests": [],
            "experience": [],
            "education": [],
            "skills": [],
            "publications": [],
            "projects": [],
            "Languages": [],
            "certifications": []
        }
        app.dependency_overrides[get_groq_client] = lambda: make_mock_groq_client(minimal_response)
        response = client.post(
            "/tailor-resume",
            data={"cv_markdown": "test cv", "job_description": "test jd"}
        )
        assert response.status_code == 200