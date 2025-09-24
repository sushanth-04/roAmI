import './App.css';
import Header from './components/header';
import Navbar from './components/navbar';
import Car from './pages/car';
import User from './pages/user';
import Hotel from './pages/hotel';
import Home from './pages/home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Routes and Route

function App() {
  return (
    <Router> {/* Wrap everything with Router to enable routing */}
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} /> {/* Define route for the Car page */}
        <Route path="/car" element={<Car />} /> {/* Define route for the Car page */}
        <Route path="/users" element={<User />} /> {/* Define route for the Car page */}
        <Route path="/hotel" element={<Hotel />} /> {/* Define route for the Car page */}
        {/* You can define other routes here */}
        {/* <Route path="/another-page" element={<AnotherPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
