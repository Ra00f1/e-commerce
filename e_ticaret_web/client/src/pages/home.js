import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar'; // Doğru yola import edin
import ProductCard from '../components/ProductCard'; // Doğru yola import edin
import laptopImage from '../images/laptop.jpg';
import iphoneImage from '../images/phone.jpg';
import headphoneImage from '../images/headphone.jpg';

const Home = () => {
    // Tüm ürünlerin listesi
    const allProducts = [
        { name: 'Laptop', price: '3000₺', category: 'Bilgisayar', image: laptopImage },
        { name: 'iPhone6', price: '5000₺', category: 'Telefon', image: iphoneImage },
        { name: 'Kulaklık', price: '200₺', category: 'Kulaklık', image: headphoneImage },
        { name: 'Laptop', price: '8000₺', category: 'Bilgisayar', image: laptopImage },
        { name: 'iPhone6s', price: '6000₺', category: 'Telefon', image: iphoneImage },
        { name: 'Kulaklık', price: '100₺', category: 'Kulaklık', image: headphoneImage },
        { name: 'Laptop', price: '4000₺', category: 'Bilgisayar', image: laptopImage },
        { name: 'iPhone7', price: '7000₺', category: 'Telefon', image: iphoneImage },
        // Diğer ürünler
    ];

    const [selectedCategory, setSelectedCategory] = useState('Hepsi');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState(allProducts);

    useEffect(() => {
        let filtered = allProducts;
        
        if (selectedCategory !== 'Hepsi') {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        if (searchTerm !== '') {
            filtered = filtered.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredProducts(filtered);
    }, [selectedCategory, searchTerm]);

    return (
        <div>
            <Navbar /> {/* Navbar'ı Home sayfasına taşıdık */}
            <header className="App-header">
                <h1 style={{ textAlign: 'center' }}>E Ticaret Sistesi</h1>
                <input 
                    type="text" 
                    className="search-bar" 
                    placeholder="Ürünleri ara..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </header>
            <main>
                {/* Kategoriler */}
                <div className="categories">
                    <div className="category-card" onClick={() => setSelectedCategory('Hepsi')}>Hepsi</div>
                    <div className="category-card" onClick={() => setSelectedCategory('Bilgisayar')}>Bilgisayar</div>
                    <div className="category-card" onClick={() => setSelectedCategory('Telefon')}>Telefon</div>
                    <div className="category-card" onClick={() => setSelectedCategory('Kulaklık')}>Kulaklık</div>
                </div>
                {/* Ürünlerin listesi */}
                <div className="product-list">
                    {filteredProducts.map((product, index) => (
                        <ProductCard
                            key={index}
                            name={product.name}
                            price={product.price}
                            category={product.category}
                            image={product.image}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Home;
