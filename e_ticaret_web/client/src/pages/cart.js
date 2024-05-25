import Modal from 'react-modal';
import './styles/cart.css';
import React, { useState, useEffect } from 'react';
import axios from "axios";
Modal.setAppElement('#root'); // Accessibility için

const Purchase = async (id) =>
{
    const url = `http://localhost:3001/purchase`;

    try {
        const response = await axios.post(url, {
            userID: id,
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

        // Show the error message as a popup
        alert("Error: " + error.response.data.message)

        const message = error.response?.data?.message || 'Unknown error occurred';
        console.error('Error message:', message);
        return null; // Indicate request failure
        }
};

const RemoveOneItemFromBasket = async (id, productID) => {
    const url = 'http://localhost:3001/removeOneItemFromBasket';

    //TODO: 2 duplicates for this function
    try {
        const response = await axios.post(url, {
            userID: id,
            productID: productID
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

const RemoveOneFromBasketItem = async (id, productID) => {
    const url = 'http://localhost:3001/removeOneFromBasket';

    try {
        const response = await axios.post(url, {
            userID: id,
            productID: productID
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

const GetBasket = async (id) => {
    const url = `http://localhost:3001/getBasket/${id}`; // Replace with your actual API endpoint URL

    try {
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json'
            }
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

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Load the userID from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const userDataJson = JSON.parse(userData);
            setUserId(userDataJson.userID);
        }
    }, []);

    useEffect(() => {
        const fetchCartItems = async () => {
            if (userId) {
                const items = await GetBasket(userId);
                for (let i = 0; i < items.length; i++) {
                }
                if (items) {
                    setCartItems(items);
                    console.log('Cart items:', items);
                } else {
                    console.error('Failed to fetch cart items');
                }
            }
        };

        fetchCartItems();
    }, [userId]);

    const handleIncreaseQuantity = (id) => {
        setCartItems(cartItems.map(item =>
            Number(item.item.id) === Number(id) ? { ...item, quantity: item.quantity + 1 } : item
        ));
    };

    const handleDecreaseQuantity = async (id) => {
        const userData = JSON.parse(localStorage.getItem('userData'));

        // Check if the item quantity is 1, if so, remove the item
        const item = cartItems.find(item => Number(item.item.id) === Number(id));
        if (Number(item.quantity) === 1) {
            await RemoveOneFromBasketItem(userData.userID, item.productID);
            handleRemoveItem(Number(item.item.id));
        } else {
            await RemoveOneFromBasketItem(userData.userID, item.productID);
            setCartItems(cartItems.map(item =>
                Number(item.item.id) === Number(id) ? { ...item, quantity: item.quantity - 1 } : item
            ));
        }
    };

    const handleRemoveItem = (id) => {
        setCartItems(cartItems.filter(item => Number(item.item.id) !== Number(id)));
    };

    const handleCheckout = async () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const Purchase_Result = await Purchase(userData.userID);
        console.error("Error", Purchase_Result);
        if (Purchase_Result === null) {
            console.error('Failed to purchase items');
        } else {
            // Clear the cart
            setCartItems([]);
            setModalIsOpen(true);
        }
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const totalCost = cartItems.reduce((total, item) => total + item.item.price * item.quantity, 0);

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
                    <tr key={item.item.productID} className="cart-item">
                        <td><img src={item.item.pictureUrl} alt={item.item.name} className="cart-item-image" /></td>
                        <td>{item.item.name}</td>
                        <td>{item.item.price} TL</td>
                        <td>
                            <button className="quantity-button" onClick={() => {handleDecreaseQuantity(item.productID)}}>-</button>

                            <span className="quantity">{item.quantity}</span>
                            <button
                                className="quantity-button"
                                onClick={() => {
                                    const userId = JSON.parse(localStorage.getItem('userData')).userID;
                                    AddToBasket(userId, item.productID, 1);
                                    handleIncreaseQuantity(item.productID);
                                }}
                            >+</button>
                        </td>

                        <td>{item.item.price * item.quantity} TL</td>
                        <td>
                            <button onClick={() =>{
                                const userId = JSON.parse(localStorage.getItem('userData')).userID;
                                RemoveOneItemFromBasket(userId, item.productID);
                                handleRemoveItem(item.productID);
                            }} className="remove-button">Remove
                            </button>
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
