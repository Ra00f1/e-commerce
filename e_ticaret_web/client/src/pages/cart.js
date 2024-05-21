import React, { useState } from "react";
import Modal from 'react-modal';
import './styles/cart.css';
import laptopImage from '../images/laptop.jpg';
import iphoneImage from '../images/phone.jpg';
import headphoneImage from '../images/headphone.jpg';

Modal.setAppElement('#root'); // Accessibility için

const Cart = () => {
    // Sepet öğelerini içeren bir dizi oluşturun
    const initialCartItems = [
        { id: 1, name: 'Laptop', price: 3000, image: laptopImage, quantity: 2 },
        { id: 2, name: 'iPhone', price: 5000, image: iphoneImage, quantity: 1 },
        { id: 3, name: 'Kulaklık', price: 200, image: headphoneImage, quantity: 3 }
    ];

    const [cartItems, setCartItems] = useState(initialCartItems);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const handleIncreaseQuantity = (id) => {
        setCartItems(cartItems.map(item => 
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    const handleDecreaseQuantity = (id) => {
        setCartItems(cartItems.map(item =>
            item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
        ));
    };

    const handleRemoveItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const handleCheckout = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const totalCost = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <div className="cart-container">
            <h1>Cart Page</h1>
            <table className="cart-table">
                <thead>
                    <tr>
                        <th>Product (Image)</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Handle</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map(item => (
                        <tr key={item.id} className="cart-item">
                            <td><img src={item.image} alt={item.name} className="cart-item-image" /></td>
                            <td>{item.name}</td>
                            <td>{item.price} TL</td>
                            <td>
                                <button className="quantity-button" onClick={() => handleDecreaseQuantity(item.id)}>-</button>
                                <span className="quantity">{item.quantity}</span>
                                <button className="quantity-button" onClick={() => handleIncreaseQuantity(item.id)}>+</button>
                            </td>
                            <td>{item.price * item.quantity} TL</td>
                            <td>
                                <button onClick={() => handleRemoveItem(item.id)} className="remove-button">Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="total-checkout">
                <div className="total">
                    Toplam: <span>{totalCost} TL</span>
                </div>
                <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Order Confirmation"
                className="Modal"
                overlayClassName="Overlay"
            >
                <h2>Your order has been successfully received!</h2>
                <button onClick={closeModal}>Kapat</button>
            </Modal>
        </div>
    );
}

export default Cart;
