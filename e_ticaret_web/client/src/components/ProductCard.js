import React from 'react';
import './ProductCard.css';

function ProductCard({ name, price, category, image }) {
  const handleAddToCart = () => {
    // Sepete ekleme işlemleri burada yapılacak
    console.log('Ürün sepete eklendi:', name);
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
