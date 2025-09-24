import './header.css';
import logo from '../assets/logo.png';
// import user from '../assets/woman.png';

export default function Header() {

    return (
        <div className="header-main">
            <div className="header-1">
                {/* <img src={logo} alt="" /> */}
                <h1>roAmI</h1>
            </div>
            <div className="header-2">
                <h3>Car Provider Portal</h3>
            </div>
        </div>
    );
}
