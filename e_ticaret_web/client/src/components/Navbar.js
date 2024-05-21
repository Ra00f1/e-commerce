import React from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header>
      <nav className="navbar">
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/payment">Payment</Link></li> 
          <li><Link to="/cart">Cart</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
