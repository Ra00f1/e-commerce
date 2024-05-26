import React from 'react';
import './ProductCard.css';
import axios from 'axios';

const AddToBasket = async (id, productID, quantity) => {
    const url = 'http://localhost:3001/addToBasket';

    try {
        const response = await axios.post(url, {
            userID: id,
            productID: productID,
            quantity: quantity
        });

        if (response.status !== 200) {
            const message = response.data.message;
            console.error('Error:', message);
            throw new Error(message);
        }

        const data = response.data;
        console.log('Status:', response.status);
        console.log('Body:', data);
        return data; // Return the response data
    } catch (error) {
        console.error('Full error:', error); // Log the full error object
        const message = error.response?.data?.message || 'Unknown error occurred';
        console.error('Error message:', message);
        return null; // Indicate request failure
    }
};

function ProductCard({ name, price, category, image , id}) {
  const handleAddToCart = () => {
    // Load the userID from localStorage
    const userData = localStorage.getItem('userData');
    // convert userData to JSON
    const userDataJson = JSON.parse(userData);
    console.log(userDataJson._id, id);
    AddToBasket(userDataJson._id, id, 1).then(r => console.log(r));
  };

  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <h2>{name}</h2>
      <p>{price}</p>
      <p>Category: {category}</p>
      <button onClick={handleAddToCart}>Sepete Ekle</button>
    </div>
  );
}

export default ProductCard;
