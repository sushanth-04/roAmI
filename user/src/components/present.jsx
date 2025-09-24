import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './present.css';

export default function Present() {
  const [plan, setPlan] = useState(null);
  const [carBookings, setCarBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [hotelDetails, setHotelDetails] = useState({});
  const [planSource, setPlanSource] = useState('');

  const authToken = localStorage.getItem('authToken');
  const navigate = useNavigate();

  // Load plan
  useEffect(() => {
    const savedPlan = localStorage.getItem('userPlan');
    if (savedPlan) {
      try {
        const parsedPlan = JSON.parse(savedPlan);
        setPlan(parsedPlan);
      } catch {
        setPlan(savedPlan);
      }
      setPlanSource('localStorage (Recently Saved)');
    } else {
      fetch('http://localhost:3000/api/auth/getplan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': authToken,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setPlan(data.plan);
          setPlanSource('Server');
          localStorage.setItem('userPlan', JSON.stringify(data.plan));
        })
        .catch(() => setPlanSource('Error loading plan'));
    }
  }, [authToken]);

  // Load car bookings
  useEffect(() => {
    fetch('http://localhost:3000/api/auth/bookedcars', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': authToken,
      },
    })
      .then((res) => res.json())
      .then((data) => setCarBookings(data.bookedCars))
      .catch(console.error);
  }, [authToken]);

  // Load hotel bookings + details
  useEffect(() => {
    fetch('http://localhost:3000/api/auth/gethotelbookings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': authToken,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setHotelBookings(data.bookedHotels);
        data.bookedHotels.forEach((booking) => {
          fetch(`http://localhost:3000/api/auth/gethoteldetails/${booking.hotel}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'auth-token': authToken,
            },
          })
            .then((res) => res.json())
            .then((hotelData) =>
              setHotelDetails((prev) => ({ ...prev, [booking._id]: hotelData }))
            )
            .catch(console.error);
        });
      })
      .catch(console.error);
  }, [authToken]);

  // Actions
  const handleRescheduleClick = () => navigate('/plan?reschedule=true');

  const handleRefreshPlan = () => {
    fetch('http://localhost:3000/api/auth/getplan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': authToken,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPlan(data.plan);
        setPlanSource('Server (Refreshed)');
        localStorage.setItem('userPlan', JSON.stringify(data.plan));
      })
      .catch(() => setPlanSource('Error refreshing plan'));
  };

  const handleClearSavedPlan = () => {
    localStorage.removeItem('userPlan');
    setPlan(null);
    setPlanSource('');
    handleRefreshPlan();
  };

  return (
    <>
      <div className="present-main">
        {/* PLAN SECTION */}
        <div className="pre-1">
          <div className="plan-header">
            <h1>Your Plan</h1>
            {planSource && <p className="plan-source"></p>}
          </div>

          {plan ? (
            <div
              className="plan-content"
              dangerouslySetInnerHTML={{ __html: plan }}
            />
          ) : (
            <p>Generate Your Plan..</p>
          )}

          <div className="plan-actions">
            <button className="action-btn blue" onClick={handleRescheduleClick}>
              Reschedule
            </button>
            {localStorage.getItem('userPlan') && (
              <button className="action-btn red" onClick={handleClearSavedPlan}>
                Clear Saved Plan
              </button>
            )}
          </div>
        </div>

        <div className="bookings-wrapper">
          {/* CAR BOOKINGS */}
          <div className="bookings-container">
            <h2>Your Car Bookings</h2>
            {carBookings.length > 0 ? (
              carBookings.map((booking, index) => (
                <div key={index} className="booking-card">
                  {booking.carDetails?.image ? (
                    <img
                      src={`http://localhost:3000${booking.carDetails.image}`}
                      alt="Car"
                      className="car-image"
                    />
                  ) : (
                    <div className="no-image">No Image Available</div>
                  )}
                  <div className="booking-info">
                    <h3>{booking.carDetails?.model || 'Unknown Model'}</h3>
                    <p><strong>Provider:</strong> {booking.providerDetails?.name || 'Unknown'}</p>
                    <p><strong>Phone:</strong> {booking.providerDetails?.phn || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status}</span></p>
                    <p><strong>Dates:</strong> {booking.dates.join(', ')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bookings">No car bookings found</div>
            )}
          </div>

          {/* HOTEL BOOKINGS */}
          <div className="bookings-container">
            <h2>Your Hotel Bookings</h2>
            {hotelBookings.length > 0 ? (
              hotelBookings.map((booking, index) => {
                const hotel = hotelDetails[booking._id];
                return (
                  <div key={index} className="booking-card">
                    {hotel?.image ? (
                      <img
                        src={`http://localhost:3000/${hotel.image.replace(/\\/g, '/')}`}
                        alt="Hotel"
                        className="hotel-image"
                      />
                    ) : (
                      <div className="no-image">No Image Available</div>
                    )}
                    <div className="booking-info">
                      <h3>{hotel?.name || 'Unknown Hotel'}</h3>
                      <p><strong>Location:</strong> {hotel?.location || 'Unknown'}</p>
                      <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status}</span></p>
                      <p><strong>Dates:</strong> {booking.dates.join(', ')}</p>
                      <p><strong>Rooms:</strong> {booking.rooms}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-bookings">No hotel bookings found</div>
            )}
          </div>
        </div>
      </div>
      <div className="footer">
        <p>&copy; 2023 roAmI. All rights reserved.</p>
      </div>
    </>
  );
}
