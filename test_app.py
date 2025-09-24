import pytest
import json
from unittest.mock import patch, MagicMock, mock_open

# Before importing the app, set the environment for testing
import os
os.environ['MOCK_MODE'] = 'True'

from app import app, generate_trip_prompt, generate_reschedule_prompt, sanitize_html, _process_plan_request, _process_reschedule_request, enhance_with_local_insights, generate_with_gemini

# --- Fixtures ---

@pytest.fixture
def client():
    """A test client for the app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# --- Helper Function Tests ---

def test_generate_trip_prompt():
    prompt = generate_trip_prompt("Paris", "Rome", 5)
    assert "Paris" in prompt
    assert "Rome" in prompt
    assert "5-day" in prompt
    assert "You are a world-class travel expert" in prompt

def test_generate_reschedule_prompt():
    prompt = generate_reschedule_prompt("Old plan here", "more relaxing")
    assert "Old plan here" in prompt
    assert "more relaxing" in prompt
    assert "You are an expert travel assistant" in prompt

def test_sanitize_html_removes_scripts():
    raw_html = "<h1>Title</h1><script>alert('xss')</script><p>Content</p>"
    clean_html = sanitize_html(raw_html)
    assert "<script>" not in clean_html
    assert "alert('xss')" not in clean_html
    assert "<h1>Title</h1>" in clean_html

# --- Service Logic Tests ---

@patch('app.generate_with_gemini')
@patch('app.enhance_with_local_insights')
@patch('app.sanitize_html')
def test_process_plan_request_success(mock_sanitize, mock_enhance, mock_gemini):
    # Arrange
    mock_gemini.return_value = "raw plan"
    mock_enhance.return_value = "enhanced plan"
    mock_sanitize.return_value = "sanitized plan"
    
    data = {"source": "Mumbai", "destination": "Delhi", "days": 7}
    
    # Act
    response, status_code = _process_plan_request(data)
    
    # Assert
    assert status_code == 200
    assert response["plan"] == "sanitized plan"
    assert "Your efficient 7-day itinerary" in response["message"]
    mock_gemini.assert_called_once()
    mock_enhance.assert_called_once_with("raw plan", "Delhi")
    mock_sanitize.assert_called_once_with("enhanced plan")

@pytest.mark.parametrize("data, error_message", [
    ({"source": "A"}, "Source, destination, and days are required!"),
    ({"source": "A", "destination": "B"}, "Source, destination, and days are required!"),
    ({"source": "A", "destination": "B", "days": "abc"}, "Days must be a valid number."),
    ({"source": "A", "destination": "B", "days": 0}, "Days must be a number between 1 and 30"),
    ({"source": "A", "destination": "B", "days": 31}, "Days must be a number between 1 and 30"),
])
def test_process_plan_request_invalid_input(data, error_message):
    response, status_code = _process_plan_request(data)
    assert status_code == 400
    assert response["error"] == error_message

@patch('app.generate_with_gemini')
@patch('app.sanitize_html')
def test_process_reschedule_request_success(mock_sanitize, mock_gemini):
    # Arrange
    mock_gemini.return_value = "updated raw plan"
    mock_sanitize.return_value = "sanitized updated plan"
    
    data = {"plan": "old plan", "suggestion": "make it adventurous"}
    
    # Act
    response, status_code = _process_reschedule_request(data)
    
    # Assert
    assert status_code == 200
    assert response["updatedPlan"] == "sanitized updated plan"
    assert "Your itinerary has been updated" in response["message"]
    mock_gemini.assert_called_once()
    mock_sanitize.assert_called_once_with("updated raw plan")

@pytest.mark.parametrize("data, error_message", [
    ({}, "Both plan and suggestion are required!"),
    ({"plan": "some plan"}, "Both plan and suggestion are required!"),
    ({"suggestion": "some suggestion"}, "Both plan and suggestion are required!"),
])
def test_process_reschedule_request_invalid_input(data, error_message):
    response, status_code = _process_reschedule_request(data)
    assert status_code == 400
    assert response["error"] == error_message


# --- Route (Endpoint) Tests ---

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["status"] == "healthy"

@patch('app._process_plan_request')
def test_plan_trip_endpoint_success(mock_process, client):
    mock_process.return_value = ({"plan": "test plan", "message": "success"}, 200)
    response = client.post("/plan", json={"source": "A", "destination": "B", "days": 3})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["plan"] == "test plan"
    mock_process.assert_called_once()

def test_plan_trip_endpoint_no_json(client):
    response = client.post("/plan", data="not json")
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data["error"] == "Request body must be JSON."

@patch('app._process_reschedule_request')
def test_reschedule_plan_endpoint_success(mock_process, client):
    mock_process.return_value = ({"updatedPlan": "new plan", "message": "success"}, 200)
    response = client.post("/reschedule", json={"plan": "old", "suggestion": "new"})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["updatedPlan"] == "new plan"
    mock_process.assert_called_once()

# --- Mock-dependent function tests ---

@patch('app.open', new_callable=mock_open, read_data='<h1>Mock Data</h1>')
def test_generate_with_gemini_in_mock_mode(mock_file):
    with patch('app.MOCK_MODE', True):
        result = generate_with_gemini("any prompt")
        assert result == '<h1>Mock Data</h1>'
        mock_file.assert_called_once_with('mock_data.html', 'r', encoding='utf-8')

@patch('app.gemini_model')
def test_generate_with_gemini_api_call_success(mock_gemini_model):
    mock_response = MagicMock()
    mock_response.text = "Gemini response"
    mock_gemini_model.generate_content.return_value = mock_response
    with patch('app.MOCK_MODE', False):
        result = generate_with_gemini("a real prompt")
    assert result == "Gemini response"
    mock_gemini_model.generate_content.assert_called_once_with("a real prompt")

@patch('app.json.load')
@patch('app.open', new_callable=mock_open)
def test_enhance_with_local_insights_success(mock_file, mock_json_load):
    mock_json_load.return_value = {"goa": "Rent a scooter."}
    result = enhance_with_local_insights("<h1>Goa Trip</h1>", "Goa")
    assert "Rent a scooter" in result
    assert "Quick Travel Tips for Goa" in result
    mock_file.assert_called_once_with('local_tips.json', 'r', encoding='utf-8')