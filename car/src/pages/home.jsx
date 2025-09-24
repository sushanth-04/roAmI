import { useState, useEffect } from "react";
import axios from "axios";
import "./home.css";

export default function Home() {
  const [cars, setCars] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newCar, setNewCar] = useState({
    model: "",
    rent: "",
    regdNumber: "",
    image: null,
  });

  useEffect(() => {
    fetchCars();
    fetchPendingRequests();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/carProviders/getcars",
        { headers: { "auth-token": localStorage.getItem("authToken") } }
      );

      if (response.data && Array.isArray(response.data)) {
        setCars(response.data);
      } else {
        console.error("Unexpected fetchCars response:", response.data);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
        // Use the same endpoint as History page since that one works
        const response = await fetch("http://localhost:3000/api/carProviders/getbookings", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem("authToken")
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        console.log("=== PENDING REQUESTS DEBUG ===");
        console.log("All bookings:", data);
        
        // Filter for pending requests only
        const pending = Array.isArray(data) 
            ? data.filter(booking => booking.status === 'pending')
            : [];
            
        console.log("Filtered pending requests:", pending);
        setPendingRequests(pending);
        
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        setPendingRequests([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCar({ ...newCar, [name]: value });
  };

  const handleImageChange = (e) => {
    setNewCar({ ...newCar, image: e.target.files[0] });
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("model", newCar.model);
      formData.append("rent", newCar.rent);
      formData.append("regdNumber", newCar.regdNumber);
      if (newCar.image) {
        formData.append("image", newCar.image);
      }

      const response = await axios.post(
        "http://localhost:3000/api/carProviders/addcar",
        formData,
        { headers: { "auth-token": localStorage.getItem("authToken"), "Content-Type": "multipart/form-data" } }
      );

      if (response.data && response.data.cars) {
        setCars(response.data.cars);
        setNewCar({ model: "", rent: "", regdNumber: "", image: null });
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error adding car:", error);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    if (!bookingId) {
      console.error("Invalid booking ID:", bookingId);
      return;
    }
  
    try {
      const response = await axios.put(
        `http://localhost:3000/api/bookings/updatestatus/${bookingId}`,
        { status: newStatus },
        {
          headers: { "auth-token": `${localStorage.getItem("authToken")}` },
        }
      );
  
      if (response.data.success) {
        alert(`Booking ${newStatus} successfully!`);
        fetchPendingRequests(); // Refresh the list
      } else {
        console.error("Failed to update booking status:", response.data);
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  return (
    <div className="home-main">
      <h1>Your Cars</h1>

      <div className="cars-container">
        {cars.length === 0 ? (
          <p>No cars added yet.</p>
        ) : (
          cars.map((car) => (
            <div className="car-card" key={car.regdNumber}>
              <h3>{car.model}</h3>
              <p>Registration Number: {car.regdNumber}</p>
              <p>Rent: ₹{car.rent}</p>
              <p>Booked Dates: {car.bookedDates.join(", ") || "None"}</p>
              {car.image && (
                <img
                  src={`http://localhost:3000${car.image}`}
                  alt={car.model}
                  className="car-image"
                />
              )}
            </div>
          ))
        )}
      </div>

      <div className="add-car-form">
        <h2>Add a New Car</h2>
        <form onSubmit={handleAddCar} encType="multipart/form-data">
          <div className="form-group">
            <label htmlFor="model">Car Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={newCar.model}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rent">Rent</label>
            <input
              type="number"
              id="rent"
              name="rent"
              value={newCar.rent}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="regdNumber">Registration Number</label>
            <input
              type="text"
              id="regdNumber"
              name="regdNumber"
              value={newCar.regdNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Car Image</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
          </div>
          <button type="submit">Add Car</button>
        </form>
      </div>

      <div className="pending-requests">
        <h2>Pending Requests</h2>
        {/* Debug information */}
        <p>Total pending requests: {pendingRequests.length}</p>
        
        {pendingRequests.length === 0 ? (
          <p>No pending requests found.</p>
        ) : (
          pendingRequests.map((request, index) => {
            console.log("Rendering request:", request); // Debugging
            
            return (
              <div key={request._id || index} className="request-card">
                <h3>Booking Request</h3>
                <p><strong>User:</strong> {request.user?.name || 'Unknown'} ({request.user?.email || 'Unknown'})</p>
                <p><strong>Car ID:</strong> {request.car}</p>
                <p><strong>Requested Dates:</strong> {Array.isArray(request.dates) ? request.dates.join(", ") : 'No dates'}</p>
                <p><strong>Status:</strong> {request.status}</p>
                <div className="button-group">
                  {request._id ? (
                    <>
                      <button className="accept-btn" onClick={() => handleStatusChange(request._id, "confirmed")}>
                        Accept
                      </button>
                      <button className="reject-btn" onClick={() => handleStatusChange(request._id, "canceled")}>
                        Reject
                      </button>
                    </>
                  ) : (
                    <p style={{ color: "red" }}>Missing Booking ID</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}