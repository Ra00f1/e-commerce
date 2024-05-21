// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Cart from './pages/cart';
import Payment from './pages/payment';
import Signup from './pages/signup';
import Signin from './pages/signin';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
