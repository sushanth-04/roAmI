import { useEffect, useState } from "react";
import "./history.css";

export default function History() {
  const [bookings, setBookings] = useState([]); // State for storing booking data
  const [loading, setLoading] = useState(true); // State to indicate loading status
  const [error, setError] = useState(null); // State for handling errors

  // Enhanced token retrieval with validation
  const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    console.log("Retrieved token:", token ? "Token exists" : "No token found");
    return token;
  };

  // Enhanced axios request with better error handling
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    const config = {
      ...options,
      headers: {
        // Only send the auth-token header that your backend middleware expects
        "auth-token": token,
        ...options.headers,
      },
    };

    console.log("Making request to:", url);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          throw new Error("Session expired. Please login again.");
        } else if (response.status === 403) {
          throw new Error("Access denied. Insufficient permissions.");
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  };

  // Function to fetch all bookings data (history)
  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching booking history...");
      
      const data = await makeAuthenticatedRequest(
        "http://localhost:3000/api/hotels/gethotelbookinghistory",
        { method: "GET" }
      );

      console.log("Booking history received:", data);
      
      // The backend now includes user data in each booking
      setBookings(data.bookedHotels || []);
      
    } catch (error) {
      console.error("Error fetching booking history:", error);
      setError(error.message || "Failed to load booking history. Please try again.");
      
      // If authentication failed, you might want to redirect to login
      if (error.message.includes("login again")) {
        console.log("Redirect to login needed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings data when the component mounts
  useEffect(() => {
    fetchBookingHistory();
  }, []);

  // Format dates for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'canceled':
        return 'status-canceled';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-container">
          <p>Loading booking history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h2>Hotel Booking History</h2>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchBookingHistory}>
            Retry
          </button>
        </div>
      )}

      <div className="booking-summary">
        <p>Total Bookings: {bookings.length}</p>
        <p>Confirmed: {bookings.filter(b => b.status === 'confirmed').length}</p>
        <p>Canceled: {bookings.filter(b => b.status === 'canceled').length}</p>
        <p>Pending: {bookings.filter(b => b.status === 'pending').length}</p>
      </div>

      <div className="booking-cards">
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <div key={booking._id || `booking-${index}`} className="booking-card">
              <div className="booking-header">
                <div className="user-info">
                  <img
                    src={booking.user?.image || "/default-avatar.png"}
                    alt={booking.user?.name || "User"}
                    className="user-image"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <div className="user-details">
                    <p className="user-name">{booking.user?.name || 'N/A'}</p>
                    <p className="user-email">{booking.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className={`booking-status ${getStatusClass(booking.status)}`}>
                  {booking.status?.toUpperCase() || 'UNKNOWN'}
                </div>
              </div>

              <div className="booking-details">
                <h3>{booking.hotel?.name || 'Hotel Name N/A'}</h3>
                
                <div className="booking-info">
                  <p><strong>Rooms:</strong> {booking.rooms || 'N/A'}</p>
                  
                  <p><strong>Dates:</strong> {
                    Array.isArray(booking.dates) && booking.dates.length > 0
                      ? booking.dates.map(date => formatDate(date)).join(" to ")
                      : 'N/A'
                  }</p>
                  
                  <p><strong>Booking Date:</strong> {
                    booking.createdAt 
                      ? formatDate(booking.createdAt)
                      : 'N/A'
                  }</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-bookings">
            <p>No booking history found</p>
            <p>Bookings will appear here once customers make reservations at your hotel.</p>
          </div>
        )}
      </div>

      {/* Debug section - remove in production */}
      <div className="debug-section" style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', fontSize: '0.8rem' }}>
        <h4>Debug Info (Remove in Production)</h4>
        <p>Token exists: {getAuthToken() ? 'Yes' : 'No'}</p>
        <p>Total bookings: {bookings.length}</p>
        <button onClick={() => console.log('Current bookings:', bookings)}>
          Log Bookings
        </button>
      </div>
    </div>
  );
}