import { useEffect, useState } from "react";
import "./history.css";

export default function History() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const authToken = localStorage.getItem("authToken");
                const response = await fetch("http://localhost:3000/api/carProviders/getbookings", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": authToken
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch bookings");
                }

                const data = await response.json();
                console.log("Bookings data:", data); // Debug log
                setBookings(data);
            } catch (error) {
                console.error("Error fetching bookings:", error.message);
            }
        };

        fetchBookings();
    }, []);

    return (
        <div className="history-container">
            <h2>Booking History</h2>
            <div className="booking-list">
                {bookings.length === 0 ? (
                    <p>No bookings found</p>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            {/* Fixed image URL - add base URL if needed */}
                            {booking.image && (
                                <img 
                                    src={booking.image.startsWith('http') 
                                        ? booking.image 
                                        : `http://localhost:3000${booking.image}`
                                    } 
                                    alt={booking.model} 
                                    className="car-image"
                                    onError={(e) => {
                                        console.log("Image failed to load:", booking.image);
                                        e.target.style.display = 'none'; // Hide broken image
                                    }}
                                />
                            )}
                            {!booking.image && (
                                <div className="no-image-placeholder">No Image Available</div>
                            )}
                            <h3>{booking.model}</h3>
                            <p><strong>Rent:</strong> ₹{booking.rent}/day</p>
                            <p><strong>Reg. Number:</strong> {booking.regdNumber}</p>
                            <p><strong>User:</strong> {booking.user} ({booking.userEmail})</p>
                            <p><strong>Dates:</strong> {
                                booking.dates && booking.dates.length > 0 
                                    ? `${new Date(booking.dates[0]).toDateString()} - ${new Date(booking.dates[booking.dates.length - 1]).toDateString()}`
                                    : 'No dates specified'
                            }</p>
                            <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status}</span></p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}