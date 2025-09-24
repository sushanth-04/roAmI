import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './hotel.css'; // Make sure to style it in your CSS file

export default function Hotel() {
  const [hotels, setHotels] = useState([]);

  // Fetch hotel data from the API
  useEffect(() => {
    axios.get('http://localhost:3000/api/admin/hotels') // Make sure this URL matches your backend endpoint
      .then(response => {
        setHotels(response.data);
      })
      .catch(error => {
        console.error('Error fetching hotels:', error);
      });
  }, []);

  return (
    <div className="hotel-container">
      {hotels.map(hotel => (
        <div key={hotel._id} className="hotel-card">
          <div className="hotel-image-container">
            <img src={`http://localhost:3000/${hotel.image}`} alt={hotel.name} className="hotel-image" />
          </div>
          <div className="hotel-info">
            <h2>{hotel.name}</h2>
            <p><strong>Email:</strong> {hotel.email}</p>
            <p><strong>Phone:</strong> {hotel.phn}</p>
            <p><strong>Location:</strong> {hotel.location}</p>
            <p><strong>Address:</strong> {hotel.address}</p>
            <p><strong>Rooms:</strong> {hotel.rooms}</p>
            <p><strong>Rent:</strong> ₹{hotel.rent}</p>
            <p><strong>Availability:</strong></p>
            <ul>
              {hotel.availability.map((avail, index) => (
                <li key={index}>
                  Date: {new Date(avail.date).toLocaleDateString()} | Available Rooms: {avail.availRooms}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
