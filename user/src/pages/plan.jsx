import './plan.css';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Plan() {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    days: '',
  });

  const [generatedPlan, setGeneratedPlan] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Load saved plan if rescheduling
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('reschedule') === 'true') {
      setIsRescheduleMode(true);
      const savedPlan = localStorage.getItem('userPlan');
      if (savedPlan) {
        try {
          const parsed = JSON.parse(savedPlan);
          setGeneratedPlan(parsed);
        } catch {
          setGeneratedPlan(savedPlan);
        }
        setSaveStatus('Existing plan loaded for rescheduling');
      } else {
        setError('No saved plan found. Please generate a new plan first.');
      }
    }
  }, [location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuggestionChange = (e) => {
    setSuggestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedPlan('');
    setSaveStatus('');
    setIsRescheduleMode(false);

    try {
      const response = await fetch('http://localhost:5000/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          throw new Error('Server returned an error');
        }
        throw new Error(errData.error || 'Failed to generate plan');
      }

      const data = await response.json();
      setGeneratedPlan(data.plan);
      localStorage.setItem('userPlan', data.plan);
      setSaveStatus('Plan generated and saved!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setError('');
    setSaveStatus('');

    const previousPlan = localStorage.getItem('userPlan') || generatedPlan;
    if (!previousPlan) {
      setError('No previous plan found! Generate and save a plan first.');
      return;
    }

    if (!suggestion.trim()) {
      setError('Please describe your mood for rescheduling.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: previousPlan, suggestion }),
      });

      if (!response.ok) {
        let errData;
        try {
          errData = await response.json();
        } catch {
          throw new Error('Server returned an error while rescheduling');
        }
        throw new Error(errData.error || 'Failed to reschedule plan');
      }

      const data = await response.json();
      setGeneratedPlan(data.updatedPlan);
      localStorage.setItem('userPlan', data.updatedPlan);
      setSaveStatus('Plan rescheduled and saved!');
      setIsRescheduleMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!generatedPlan) {
      setError('No plan to save! Generate a plan first.');
      return;
    }

    localStorage.setItem('userPlan', generatedPlan);
    setSaveStatus('Plan saved successfully!');

    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleDownloadPlan = () => {
    if (!generatedPlan) {
      setError('No plan to download! Generate a plan first.');
      return;
    }

    const textPlan = generatedPlan.replace(/<[^>]*>/g, '');
    const blob = new Blob([textPlan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-plan-${formData.source || 'rescheduled'}-to-${formData.destination || 'destination'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSaveStatus('Plan downloaded!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleGoHome = () => {
    navigate('/present');
  };

  return (
    <div className="plan-main">
      <div className="plan-container">
        {/* Form Section */}
        <div className="plan-form">
          <h1>{isRescheduleMode ? 'Reschedule Your Trip' : 'Plan Your Trip'}</h1>

          {!isRescheduleMode && (
            <form onSubmit={handleSubmit} className="trip-form">
              <label>
                Source
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  placeholder="Enter Source"
                  required
                />
              </label>
              <label>
                Destination
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Enter Destination"
                  required
                />
              </label>
              <label>
                Number of Days
                <input
                  type="number"
                  name="days"
                  value={formData.days}
                  onChange={handleInputChange}
                  placeholder="Enter number of days"
                  required
                  min={1}
                />
              </label>
              <button className="generate-btn" type="submit" disabled={loading}>
                {loading ? 'Generating Plan...' : 'Generate Plan'}
              </button>
            </form>
          )}
        </div>

        {/* Plan Display & Reschedule Section */}
        <div className="plan-area">
          {error && <div className="error-message">{error}</div>}
          {saveStatus && <div className="save-status">{saveStatus}</div>}

          <div className={`generated-plan ${loading ? 'loading' : ''}`}>
            {loading ? (
              <div className="loader">Loading...</div>
            ) : (
              generatedPlan && (
                <div className="generated-text" dangerouslySetInnerHTML={{ __html: generatedPlan }} />
              )
            )}
          </div>

          {generatedPlan && (
            <div className="plan-actions">
              <button onClick={handleSavePlan} className="btn save-btn">
                Save Plan
              </button>
              <button onClick={handleDownloadPlan} className="btn download-btn">
                Download Plan
              </button>
              <button onClick={handleGoHome} className="btn home-btn">
                Go to Home
              </button>
            </div>
          )}

          <div className="reschedule-section">
            <h2>Mood check for Reschedule</h2>
            <textarea
              value={suggestion}
              onChange={handleSuggestionChange}
              placeholder="Describe your mood for rescheduling (e.g., 'more adventurous', 'prefer relaxing activities', 'budget-friendly options')"
              rows={4}
              disabled={loading || !generatedPlan}
            />
            <button onClick={handleReschedule} disabled={loading || !generatedPlan || !suggestion.trim()} className="reschedule-btn">
              {loading ? 'Rescheduling...' : 'Reschedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
