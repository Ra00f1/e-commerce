import React, { useState, useEffect } from "react";
import Navbar from '../components/Navbar'; // Doğru yola import edin
import ProductCard from '../components/ProductCard'; // Doğru yola import edin
import axios  from "axios";

const Home = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Hepsi');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        // API'den ürünleri getiren fonksiyon
        const getAllItems = async () => {
            try {
                const response = await axios.get('http://localhost:3001/getAllItems');
                if (response.status === 200) {
                    setAllProducts(response.data); // API'den gelen ürünleri state'e kaydedin
                    setFilteredProducts(response.data); // Filtrelenmiş ürünleri de başlangıçta tüm ürünler olarak ayarlayın
                } else {
                    console.error('Error fetching items:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        getAllItems();
    }, []);

    useEffect(() => {
        let filtered = allProducts;

        if (selectedCategory !== 'Hepsi') {
            filtered = filtered.filter(product => product.CategoryID === selectedCategory);
        }

        if (searchTerm !== '') {
            filtered = filtered.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredProducts(filtered);
    }, [selectedCategory, searchTerm, allProducts]);

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
                            category={product.CategoryID}
                            image={product.pictureUrl}
                            id={product._id}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}

export default Home;
