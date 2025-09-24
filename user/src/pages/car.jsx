import { useState, useEffect } from 'react';
import './car.css';

export default function Car() {
    const [cars, setCars] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCars, setFilteredCars] = useState([]);

    // Fetch cars from the backend when the component mounts
    useEffect(() => {
        fetch('http://localhost:3000/api/carProviders/getallcars')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setCars(data);
                setFilteredCars(data); // Set initial filtered cars
            })
            .catch(error => console.error('Error fetching cars:', error));
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = cars.filter(car =>
            car.model.toLowerCase().includes(query) || 
            car.regdNumber.toLowerCase().includes(query)
        );
        setFilteredCars(filtered);
    };

    // Handle "Book Now" action
    const handleBookNow = async (carId) => {
        const startDate = prompt("Enter start date (YYYY-MM-DD):");
        const endDate = prompt("Enter end date (YYYY-MM-DD):");
    
        if (!startDate || !endDate) {
            alert("Please enter valid dates.");
            return;
        }
    
        // Validate date format
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            alert("Please enter valid dates.");
            return;
        }
    
        // Ensure start date is before end date
        if (start >= end) {
            alert("Start date should be before end date.");
            return;
        }
    
        // Retrieve the token from localStorage (or wherever you're storing it)
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert("You need to be logged in to make a booking.");
            return;
        }
    
        // Create a booking object
        const bookingData = {
            carId: carId,  // Make sure this is the actual car ID
            dates: [startDate, endDate],  // Ensure this is an array of strings
        };
    
        try {
            const response = await fetch('http://localhost:3000/api/bookings/addnewcarbooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': `${token}`  // Send token in Authorization header
                },
                body: JSON.stringify(bookingData)  // Send correct data format
            });
    
            if (response.ok) {
                alert("Car booked successfully! Waiting for confirmation.");
            } else {
                const errorData = await response.json();
                alert(`Booking failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error booking car:", error);
            alert("An error occurred while booking the car.");
        }
    };
    
    
    

    return (
        <div className="car-main">
            <h1>Choose Your Car</h1>
            
            <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-bar"
                placeholder="Search by car model or registration number"
            />

            <div className="car-cards-container">
                {filteredCars.length > 0 ? (
                    filteredCars.map((car, index) => (
                        <div key={index} className="car-card">
                            <img 
                                src={car.image ? `http://localhost:3000${car.image}` : 'default-car-image.jpg'} 
                                alt={car.model} 
                                className="car-image" 
                            />
                            
                            <div className="car-details">
                                <h2>{car.model}</h2>
                                <p className="car-price">Rent: ₹{car.rent} / day</p>

                                {/* Additional Car Details */}
                                <div className="car-info">
                                    <p><strong>Registration No:</strong> {car.regdNumber}</p>
                                </div>

                                {/* Book Now Button */}
                                <button
                                    className="book-now-btn"
                                    onClick={() => handleBookNow(car._id)} // Pass car ID
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No cars available.</p>
                )}
            </div>
        </div>
    );
}
