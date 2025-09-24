import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './hotel.css';

export default function Hotel() {
    const [hotels, setHotels] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [bookingDetails, setBookingDetails] = useState({}); // ✅ Separate booking details per hotel

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const { data } = await axios.get('http://localhost:3000/api/hotels/getAllHotels');
                setHotels(data);
            } catch (error) {
                console.error('Error fetching hotels:', error);
            }
        };

        fetchHotels();
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    const filteredHotels = useMemo(() => {
        return hotels.filter(hotel =>
            hotel.location?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [hotels, searchQuery]);

    // ✅ Handle changes in the booking form for a specific hotel
    const handleInputChange = (hotelId, e) => {
        setBookingDetails(prevDetails => ({
            ...prevDetails,
            [hotelId]: {
                ...prevDetails[hotelId],
                [e.target.name]: e.target.value
            }
        }));
    };

    // ✅ Handle hotel booking
    const handleBookNow = async (hotelId) => {
        try {
            const authToken = localStorage.getItem('authToken');

            if (!authToken) {
                alert('User not logged in');
                return;
            }

            const hotelBooking = bookingDetails[hotelId] || {}; // Get specific hotel's booking details

            const response = await axios.post(
                'http://localhost:3000/api/hotels/bookRooms',
                {
                    hotelId,
                    numRooms: hotelBooking.numRooms || 1, // Default to 1 if undefined
                    startDate: hotelBooking.startDate || '',
                    endDate: hotelBooking.endDate || '',
                },
                {
                    headers: { 'auth-token': authToken }
                }
            );

            alert(response.data.message || 'Booking successful');
        } catch (error) {
            console.error('Error booking hotel:', error);
            alert(error.response?.data?.error || 'Booking failed');
        }
    };

    return (
        <div className="hotel-main">
            <h1>Choose Your Hotel</h1>

            <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-bar"
                placeholder="Search by location (e.g. Hyderabad)"
            />

            <div className="hotel-cards-container">
                {filteredHotels.map((hotel) => (
                    <div key={hotel._id} className="hotel-card">
                        <img 
                            src={`http://localhost:3000/${hotel.image}`} 
                            alt={hotel.name} 
                            className="hotel-image" 
                        />
                        <div className="hotel-details">
                            <h2>{hotel.name}</h2>
                            <p>{hotel.address}</p>
                            <p className="hotel-price">Rent: ₹{hotel.rent}/night</p>

                            <div className="hotel-info">
                                <p><strong>Rooms Available:</strong> {hotel.rooms}</p>
                                <p><strong>Contact:</strong> {hotel.phn}</p>
                                <p><strong>Location:</strong> {hotel.location}</p>
                            </div>

                            {/* Booking Form - Uses separate state for each hotel */}
                            <div className="booking-form">
                                <label>Start Date:</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={bookingDetails[hotel._id]?.startDate || ""}
                                    onChange={(e) => handleInputChange(hotel._id, e)}
                                />

                                <label>End Date:</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={bookingDetails[hotel._id]?.endDate || ""}
                                    onChange={(e) => handleInputChange(hotel._id, e)}
                                />

                                <label>Number of Rooms:</label>
                                <input
                                    type="number"
                                    name="numRooms"
                                    min="1"
                                    value={bookingDetails[hotel._id]?.numRooms || "1"}
                                    onChange={(e) => handleInputChange(hotel._id, e)}
                                />

                                <button className="book-now-btn" onClick={() => handleBookNow(hotel._id)}>
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
