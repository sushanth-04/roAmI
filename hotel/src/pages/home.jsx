import { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";

export default function Home() {
  const [hotel, setHotel] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enhanced token retrieval with validation
  const getAuthToken = () => {
    const token = localStorage.getItem("authToken");
    console.log("Retrieved token:", token ? "Token exists" : "No token found");
    return token;
  };

  // Fixed axios request - only send the header your backend expects
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
    console.log("Request headers:", config.headers);

    try {
      const response = await axios(url, config);
      return response;
    } catch (error) {
      console.error("Request failed:", {
        url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem("authToken");
        throw new Error("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("Access denied. Insufficient permissions.");
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch hotel data
        console.log("Fetching hotel data...");
        const hotelResponse = await makeAuthenticatedRequest(
          "http://localhost:3000/api/hotels/getHotel",
          { method: "GET" }
        );
        
        console.log("Hotel data received:", hotelResponse.data);
        setHotel(hotelResponse.data);

        // Fetch pending requests - Updated to use correct endpoint
        console.log("Fetching pending requests...");
        const requestsResponse = await makeAuthenticatedRequest(
          "http://localhost:3000/api/hotels/gethotelbookings",
          { method: "GET" }
        );
        
        console.log("Pending requests received:", requestsResponse.data);
        // Updated to match the response structure from your backend
        setPendingRequests(requestsResponse.data.bookedHotels || []);

      } catch (error) {
        console.error("Error in fetchData:", error);
        setError(error.message || "Failed to load data. Please try again.");
        
        // If authentication failed, you might want to redirect to login
        if (error.message.includes("login again")) {
          // Uncomment if you have navigation/routing
          // navigate('/login');
          console.log("Redirect to login needed");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enhanced status change handler with better error handling
  const handleStatusChange = async (bookingId, status) => {
    if (!bookingId) {
      setError("Invalid booking ID");
      return;
    }

    // Optimistically remove the booking from UI immediately
    const originalRequests = [...pendingRequests];
    setPendingRequests(prev => 
      prev.filter(request => request._id !== bookingId)
    );

    try {
      console.log(`Updating booking ${bookingId} to status: ${status}`);
      
      const response = await makeAuthenticatedRequest(
        `http://localhost:3000/api/hotels/updatehotelbooking/${bookingId}`,
        {
          method: "PUT",
          data: { status },
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Status update response:", response.data);

      if (response.data.success) {
        console.log(`Booking ${bookingId} ${status} successfully`);
        // Clear any previous errors
        setError(null);
        
        // Show success message briefly
        const successMessage = `Booking ${status === 'confirmed' ? 'accepted' : 'rejected'} successfully!`;
        console.log(successMessage);
        
        // Optional: Show a temporary success notification
        // You can implement a toast notification here if you want
        
      } else {
        // If the update failed, restore the original list
        setPendingRequests(originalRequests);
        throw new Error(response.data.error || "Failed to update booking status");
      }
    } catch (error) {
      console.error(`Error updating booking status to ${status}:`, error);
      
      // Restore the original list if the request failed
      setPendingRequests(originalRequests);
      
      // Show error message
      const errorMessage = error.message || `Failed to ${status === 'confirmed' ? 'accept' : 'reject'} booking. Please try again.`;
      setError(errorMessage);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="home-main">
        <div className="loading-container">
          <p>Loading your hotel dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-main">
      <h1>Your Hotel Dashboard</h1>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {hotel ? (
        <div className="hotel-card">
          <img 
            src={`http://localhost:3000/${hotel.image}`} 
            alt={hotel.name} 
            className="hotel-image"
            onError={(e) => {
              e.target.src = "/placeholder-hotel.jpg"; // Fallback image
              console.warn("Hotel image failed to load");
            }}
          />
          <div className="hotel-details">
            <h2>{hotel.name}</h2>
            <p><strong>Email:</strong> {hotel.email}</p>
            <p><strong>Phone:</strong> {hotel.phn}</p>
            <p><strong>Location:</strong> {hotel.location}</p>
            <p><strong>Address:</strong> {hotel.address}</p>
            <p><strong>Rent per night:</strong> ₹{hotel.rent}</p>
            <p><strong>Available Rooms:</strong> {hotel.rooms}</p>
          </div>
        </div>
      ) : (
        !error && <p>No hotel data available</p>
      )}

      <div className="pending-requests-section">
        <h2>Pending Booking Requests ({pendingRequests.length})</h2>
        
        {pendingRequests.length > 0 ? (
          <ul className="pending-requests">
            {pendingRequests.map((request, index) => (
              <li key={request._id || `request-${index}`} className="request-card">
                <h3>Booking Request #{index + 1}</h3>
                <div className="request-details">
                  <p><strong>User:</strong> {request.user?.name || 'N/A'} ({request.user?.email || 'N/A'})</p>
                  <p><strong>Requested Dates:</strong> {
                    Array.isArray(request.dates) 
                      ? request.dates.map(date => new Date(date).toLocaleDateString()).join(", ") 
                      : request.dates || 'N/A'
                  }</p>
                  <p><strong>Rooms Requested:</strong> {request.rooms || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`status-${request.status}`}>{request.status}</span></p>
                </div>
                
                <div className="button-group">
                  {request._id ? (
                    <>
                      <button 
                        className="accept-btn" 
                        onClick={() => handleStatusChange(request._id, "confirmed")}
                        disabled={request.status !== 'pending'}
                      >
                        Accept
                      </button>
                      <button 
                        className="reject-btn" 
                        onClick={() => handleStatusChange(request._id, "canceled")}
                        disabled={request.status !== 'pending'}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <p className="error-text">Missing Booking ID - Cannot process this request</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-requests">
            <p>No pending booking requests at the moment</p>
          </div>
        )}
      </div>

      {/* Debug section - remove in production */}
      <div className="debug-section" style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', fontSize: '0.8rem' }}>
        <h4>Debug Info (Remove in Production)</h4>
        <p>Token exists: {getAuthToken() ? 'Yes' : 'No'}</p>
        <p>Hotel loaded: {hotel ? 'Yes' : 'No'}</p>
        <p>Pending requests: {pendingRequests.length}</p>
        <button onClick={() => console.log('Current state:', { hotel, pendingRequests, error })}>
          Log Current State
        </button>
      </div>
    </div>
  );
}