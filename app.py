from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from dotenv import load_dotenv
import json
from google.generativeai.client import configure
from google.generativeai.generative_models import GenerativeModel
from bs4 import BeautifulSoup
from typing import Dict, Any, Tuple
from flask import Response

# Load environment variables
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
MOCK_MODE = os.getenv("MOCK_MODE", "False") == "True"

# Check API key
if not API_KEY and not MOCK_MODE:
    raise ValueError("GOOGLE_API_KEY not found in environment and not in MOCK_MODE.")

# Configure Gemini
gemini_model = None
if not MOCK_MODE:
    configure(api_key=API_KEY)
    # Initialize the model once globally for efficiency
    gemini_model = GenerativeModel("gemini-2.5-flash")


# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

# ---------------- ENHANCED PROMPT GENERATORS ---------------- #

def generate_trip_prompt(source: str, destination: str, days: int) -> str:
    """Generates a detailed prompt for creating a trip itinerary."""
    return f"""
    You are a world-class travel expert, known for creating perfectly balanced and practical itineraries. Your goal is to generate a {days}-day travel plan from {source} to {destination}.

    **Core Objective:** Create an itinerary that is efficient, enjoyable, and easy to follow. It should feel like a real, well-planned trip, not just a list of places.

    **Chain of Thought (Follow these steps):**
    1.  **Logistics First:** Consider the travel from {source} to {destination}. How does that impact Day 1 and the last day?
    2.  **Thematic Days:** Group activities for each day by location and theme (e.g., "Historical Old Town," "Beach Relaxation," "Mountain Hike"). This minimizes travel time.
    3.  **Pacing:** Create a balanced rhythm. Don't schedule two major, tiring activities back-to-back. Mix highlights with relaxed moments. A typical day should have 2-3 main activities, plus meals.
    4.  **Practical Details:** For each activity, include estimated time, travel between locations, and approximate costs (entry fees, food). This is critical.
    5.  **HTML Formatting:** Structure the entire output using the clean HTML format specified below.

    **Strict HTML Structure (Adhere to this exactly):**
    -   **Main Title:** `<h1>🗺️ Your {days}-Day {destination} Adventure</h1>`
    -   **Introduction:** A single `<p>` tag with a 2-sentence overview of the trip.
    -   **Daily Section:**
        -   `<h2>📅 Day X: [A Catchy Theme for the Day]</h2>`
        -   Follow this with a series of `<h3>` and `<p>` tags for the day's schedule.
    -   **Time Blocks (Use these icons):**
        -   Morning: `<h3>🌅 Morning: [Activity Name]</h3>`
        -   Lunch: `<h3>🍽️ Lunch: [Restaurant Suggestion or Area]</h3>`
        -   Afternoon: `<h3>🌞 Afternoon: [Activity Name]</h3>`
        -   Evening: `<h3>🌙 Evening: [Activity Name]</h3>`
        -   Dinner: `<h3>🍴 Dinner: [Restaurant Suggestion or Area]</h3>`
    -   **Descriptions:** Immediately after each `<h3>`, use a `<p>` tag for a 1-2 sentence description, including practical details like *duration, travel time from previous activity, and estimated cost*.
    -   **Daily Budget:** End each day's section with `<h4><strong>Estimated Daily Budget:</strong> [Approximate Cost]</h4>`

    **Example of a Perfect Day's Output:**
    ```html
    <h2>📅 Day 1: Arrival and Coastal Charm</h2>
    <h3>🌅 Morning: Arrive and Settle In</h3>
    <p>Arrive at the airport, travel to your hotel (approx. 1 hour, ₹1200 taxi). Check in and take a moment to relax.</p>
    <h3>🍽️ Lunch: Local Cafe</h3>
    <p>Enjoy a light lunch at a nearby cafe to get a taste of the local flavors (approx. ₹500).</p>
    <h3>🌞 Afternoon: Explore the Main Beach</h3>
    <p>Walk along the famous beach, enjoy the views, and maybe dip your toes in the water. This is a great, low-key way to start your trip (2-3 hours).</p>
    <h3>🌙 Evening: Sunset Point</h3>
    <p>Head to the popular sunset viewpoint (20 min walk from the beach). It's a must-see! Arrive a bit early to get a good spot.</p>
    <h4><strong>Estimated Daily Budget:</strong> ₹2000 (excluding accommodation)</h4>
    ```

    **What to Avoid:**
    -   Do not use lists (`<ul>`, `<ol>`).
    -   Do not include more than 4-5 main activities per day.
    -   Do not write long, generic descriptions. Keep them short, practical, and engaging.
    -   Do not forget to include travel times and costs. This is essential.
    -   Do not use complex HTML tags. Stick to `<h1>, <h2>, <h3>, <h4>, <p>, <strong>`.
    """


def generate_reschedule_prompt(plan: str, mood: str) -> str:
    """Generates a detailed prompt for rescheduling a trip itinerary."""
    return f"""
    You are an expert travel assistant, skilled at modifying existing itineraries to better suit a traveler's needs. Your primary goal is to be helpful and realistic.

    **Current Itinerary:**
    {plan}

    **Traveler's Request:**
    "{mood}"

    **Core Objective:** Intelligently modify the provided itinerary based on the traveler's request, while preserving the overall structure, trip duration, and logical flow.

    **Step-by-Step Thought Process:**
    1.  **Analyze the Request:** First, understand the core of the traveler's request. Are they asking for more relaxation, more adventure, a slower pace, or a budget adjustment? Identify keywords like "tired," "rushed," "cheaper," "adventurous," etc.
    2.  **Identify Target Days/Activities:** Pinpoint which parts of the itinerary need to change. Is it a specific day (e.g., "Day 2") or a general theme?
    3.  **Smart Substitution:** Do not just delete activities. Replace them with alternatives that match the request.
        -   If "tired" or "relaxing": Substitute a hike with a spa visit, a walking tour with a scenic boat ride, or a busy market with a quiet park.
        -   If "adventurous": Replace a museum visit with a zip-lining activity or a city walk with a trek.
        -   If "budget concerns": Find free alternatives (e.g., public parks, free walking tours) or cheaper options (e.g., street food instead of a fancy restaurant).
        -   If "too rushed": Remove the least essential activity of the day and extend the time for the remaining ones. Add a "Leisure Time" block.
    4.  **Recalculate Timings:** Adjust the timings for the new activities, including realistic travel times between locations. Ensure the day still flows logically.
    5.  **Preserve HTML Structure:** Re-generate the full itinerary using the *exact same HTML structure* as the original plan (`<h1>`, `<h2>`, `<h3>`, `<p>`, etc.).

    **Critical Rules to Follow:**
    -   **Do Not Change the Trip Duration:** The total number of days must remain the same unless explicitly asked.
    -   **Maintain Geographic Logic:** Do not suggest an activity that is geographically nonsensical (e.g., a location that is hours away for a 1-hour activity).
    -   **Acknowledge and Explain:** Start the response by acknowledging their request and briefly explaining the key changes you made.
    -   **Return the FULL Itinerary:** The final output must be the complete, updated itinerary for all days, not just the changed parts.

    **Response Format:**
    1.  Start with a single `<p>` tag acknowledging the request and summarizing the changes. For example: `"<p>I've updated your itinerary to be more relaxing on Day 2 by replacing the trek with a peaceful boat ride and adding more leisure time. Here is the revised plan:</p>"`
    2.  Provide the complete, day-by-day updated itinerary, following the original HTML structure precisely.
    """


# ---------------- HELPER FUNCTIONS ---------------- #

def generate_with_gemini(prompt: str) -> str:
    """Generates content using the Gemini API or returns mock data."""
    if MOCK_MODE:
        try:
            with open('mock_data.html', 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            logging.error("mock_data.html not found. Please create it for MOCK_MODE.")
            return "Error: Mock data file not found."
    
    try:
        # Use the globally initialized model
        if not gemini_model:
            # This should not be reached if MOCK_MODE is False, but it satisfies the linter
            # and acts as a safeguard.
            raise RuntimeError("Gemini model not initialized. Check MOCK_MODE and API key.")
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        logging.error(f"Error with Gemini API: {e}", exc_info=True)
        return "Sorry, there was an error generating your itinerary. Please try again."


def sanitize_html(raw_html: str) -> str:
    """Clean and validate HTML content to prevent XSS."""
    soup = BeautifulSoup(raw_html, 'html.parser')
    
    # Remove any potentially harmful tags
    for tag in soup(['script', 'style', 'meta', 'link']):
        tag.decompose()
    
    # Ensure proper structure
    clean_html = str(soup)
    return clean_html.strip()


def enhance_with_local_insights(plan: str, destination: str) -> str:
    """
    Add local insights from a JSON file to the plan based on the destination.

    This function loads tips from `local_tips.json` and uses simple substring
    matching to find a relevant tip. It's designed to be easily extendable
    by just updating the JSON file.
    """
    try:
        with open('local_tips.json', 'r', encoding='utf-8') as f:
            local_tips = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logging.warning(f"Could not load or parse local_tips.json: {e}")
        return plan  # Return original plan if tips can't be loaded

    destination_lower = destination.lower()
    for key, tip in local_tips.items():
        if key in destination_lower:
            plan += f'\n<div class="local-tips">\n<h3>💡 Quick Travel Tips for {key.title()}</h3>\n<p><em>{tip}</em></p>\n</div>'
            break

    return plan


# ------------------ SERVICE LOGIC ------------------ #

def _process_plan_request(data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
    """Validates plan request data and generates an itinerary."""
    source = data.get("source", "").strip()
    destination = data.get("destination", "").strip()
    days_raw = data.get("days")

    # Validation
    if not all([source, destination, days_raw is not None]):
        return {"error": "Source, destination, and days are required!"}, 400

    # Add assertion to help type checker understand days_raw is not None
    assert days_raw is not None

    try:
        days = int(days_raw)
        if not (1 <= days <= 30):
            return {"error": "Days must be a number between 1 and 30"}, 400
    except (ValueError, TypeError):
        return {"error": "Days must be a valid number."}, 400

    # Generate, enhance, and sanitize the plan
    prompt = generate_trip_prompt(source, destination, days)
    raw_plan = generate_with_gemini(prompt)
    enhanced_plan = enhance_with_local_insights(raw_plan, destination)
    formatted_plan = sanitize_html(enhanced_plan)

    response_data = {
        "plan": formatted_plan,
        "message": f"Your efficient {days}-day itinerary from {source} to {destination} is ready! 🎉"
    }
    return response_data, 200

def _process_reschedule_request(data: Dict[str, Any]) -> Tuple[Dict[str, str], int]:
    """Validates reschedule request data and updates an itinerary."""
    prev_plan = data.get("plan", "").strip()
    mood = data.get("suggestion", "").strip()

    if not prev_plan or not mood:
        return {"error": "Both plan and suggestion are required!"}, 400

    prompt = generate_reschedule_prompt(prev_plan, mood)
    updated_raw_plan = generate_with_gemini(prompt)
    formatted_plan = sanitize_html(updated_raw_plan)

    return {"updatedPlan": formatted_plan, "message": "Your itinerary has been updated with better timing! ✨"}, 200

# ---------------- ROUTES ---------------- #

@app.route("/plan", methods=["POST"])
def plan_trip() -> Tuple[Response, int]:
    """Generates a new trip itinerary based on user input."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON."}), 400

        response_data, status_code = _process_plan_request(data)
        return jsonify(response_data), status_code
    except Exception as e:
        logging.error(f"Error in /plan: {e}", exc_info=True)
        return jsonify({"error": "An error occurred while generating the plan. Please try again."}), 500


@app.route("/reschedule", methods=["POST"])
def reschedule_plan() -> Tuple[Response, int]:
    """Reschedules an existing itinerary based on user feedback."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body must be JSON."}), 400

        response_data, status_code = _process_reschedule_request(data)
        return jsonify(response_data), status_code
    except Exception as e:
        logging.error(f"Error in /reschedule: {e}", exc_info=True)
        return jsonify({"error": "An error occurred while rescheduling the plan. Please try again."}), 500


@app.route("/health", methods=["GET"])
def health_check() -> Response:
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Travel planner is ready to create efficient itineraries!"})


# ---------------- MAIN ---------------- #

if __name__ == "__main__":
    # Note: debug=True is not recommended for production.
    app.run(debug=True, host="0.0.0.0", port=5000)