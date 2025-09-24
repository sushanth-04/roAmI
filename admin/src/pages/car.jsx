import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './car.css'; // Make sure to style it in your CSS file

export default function Car() {
  const [carProviders, setCarProviders] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(''); // To filter by provider

  // Fetch car provider data from the API
  useEffect(() => {
    axios.get('http://localhost:3000/api/admin/carproviders') // Make sure this URL matches your API endpoint
      .then(response => {
        setCarProviders(response.data);
        setFilteredCars(response.data); // Set all cars initially
      })
      .catch(error => {
        console.error('Error fetching car providers:', error);
      });
  }, []);

  const handleFilterChange = (event) => {
    const providerId = event.target.value;
    setSelectedProvider(providerId);

    if (providerId) {
      // Filter cars by selected provider
      const filtered = carProviders.filter(provider => provider._id === providerId);
      setFilteredCars(filtered);
    } else {
      // Show all cars if no provider is selected
      setFilteredCars(carProviders);
    }
  };

  return (
    <div className="car-container">
      <div className="filter-container">
        <select className="provider-filter" onChange={handleFilterChange} value={selectedProvider}>
          <option value="">Select Provider</option>
          {carProviders.map(provider => (
            <option key={provider._id} value={provider._id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {filteredCars.map((provider) => (
        <div key={provider._id} className="car-provider-card">
          <div className="provider-info">
            <h2>{provider.name}</h2>
            <p>Email: {provider.email}</p>
            <p>Phone: {provider.phn}</p>
          </div>

          <div className="cars-list">
            {provider.cars.map((car) => (
              <div key={car._id} className="car-card">
                <img src={`http://localhost:3000${car.image}`} alt={car.model} className="car-image" />
                <div className="car-info">
                  <h3>{car.model}</h3>
                  <p>Rent: ₹{car.rent}</p>
                  <p>Registration Number: {car.regdNumber}</p>
                  <p>Booked Dates:</p>
                  <ul>
                    {car.bookedDates.length > 0 ? (
                      car.bookedDates.map((date, index) => (
                        <li key={index}>{new Date(date).toLocaleDateString()}</li>
                      ))
                    ) : (
                      <li>No bookings</li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
