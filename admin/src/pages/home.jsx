import './home.css'

export default function Home(){
    return(
        <div className="home-2">
                    <h1>Services we provide ⬇️</h1>
                    <div className="home-2-in">
                        <div className="service-card">
                            <h3>AI Trip Planning</h3>
                            <p>Get a personalized itinerary based on your destination and preferences.</p>
                            <a href="/plan">Explore</a>
                        </div>
                        <div className="service-card">
                            <h3>Mood-Based Rescheduling</h3>
                            <p>Based on your mood, AI adjusts your trip plan in real-time.</p>
                            <a href="/mood-check">Learn More</a>
                        </div>
                        <div className="service-card">
                            <h3>Car Booking</h3>
                            <p>Choose a car and book it for your trip from our trusted providers.</p>
                            <a href="/car-booking">Book Now</a>
                        </div>
                        <div className="service-card">
                            <h3>Room Booking</h3>
                            <p>Book your stay at our partner accommodations for a comfortable trip.</p>
                            <a href="/room-booking">Find Rooms</a>
                        </div>
            </div>       
            </div>       
    );
}