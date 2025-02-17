
import '../css/Navbar.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../images/logo.jpg'

const Navbar = ({ onSearch }) => {
    const [search, setSearch] = useState([]);
    const email = sessionStorage.getItem("userEmail");
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem("user"));

    const [time, setTime] = useState(new Date());

    const handleSearch = () => {
        if (search.trim() !== '') {
            onSearch(search); // Send search term to the parent
            setSearch(''); // Clear input after search
        }
    };

    

    function logout() {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("userEmail");
        localStorage.removeItem("token");
    
        sessionStorage.clear();
        localStorage.clear();
    
        setTimeout(() => {
            navigate('/login');
        }, 100);
    }
    

    useEffect(() => {
        if (email === null) {
            navigate("/login"); // Redirect to login if no user
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <nav className="navbar">
            
            <img className='logo' src={logo} alt='Logo'></img>
            <label className='name'>Paper Trading</label>
            <input type='text' className='search' placeholder='Search' value={search} onChange={(e)=>setSearch(e.target.value)}></input>
            <button className='btn-search' onClick={handleSearch}>Search</button>
            <label className='market-time' >{time.toLocaleString()}</label>
            <ul>
                {/* <li><a href="#home">Home</a></li>
                <li><a href="#contact">Contact Us</a></li>*/}
                <li><a href="/history">History</a></li> 
                <li><button onClick={logout}>Logout</button></li>

            </ul>
            <div className='profile'>
                <label>Name: {user.username}</label><br></br>
                <label>Bal: {user.balance}</label>

            </div>
        </nav>
    );
};

export default Navbar;