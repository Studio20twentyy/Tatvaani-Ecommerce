
const { useState, useEffect, useContext, createContext, useCallback } = React;

// Context for global state management
const AppContext = createContext();

// Auth Context
const useAuth = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAuth must be used within AppProvider');
  }
  return context;
};

// Cart Context
const useCart = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useCart must be used within AppProvider');
  }
  return context;
};

// Main App Provider
const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedCart = localStorage.getItem('cart');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('/api/register', { name, email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
  };

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      let newCart;
      
      if (existingItem) {
        newCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity }];
      }
      
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    user,
    cart,
    currentPage,
    setCurrentPage,
    products,
    setProducts,
    loading,
    setLoading,
    login,
    register,
    logout,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    fetchProducts
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Components

// Header Component
const Header = () => {
  const { user, logout, currentPage, setCurrentPage, getCartCount } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="bg-tatvaani-orange text-white p-3 rounded-full mr-3">
              <i className="fas fa-leaf text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-tatvaani-teal">Tatvaani</h1>
              <p className="text-sm text-gray-600 hindi-text">तत्वानि - Essence of India</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`hover:text-tatvaani-orange transition-colors ${currentPage === 'home' ? 'text-tatvaani-orange font-semibold' : 'text-gray-700'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('products')}
              className={`hover:text-tatvaani-orange transition-colors ${currentPage === 'products' ? 'text-tatvaani-orange font-semibold' : 'text-gray-700'}`}
            >
              Products
            </button>
            <button 
              onClick={() => setCurrentPage('about')}
              className={`hover:text-tatvaani-orange transition-colors ${currentPage === 'about' ? 'text-tatvaani-orange font-semibold' : 'text-gray-700'}`}
            >
              About
            </button>
            <button 
              onClick={() => setCurrentPage('contact')}
              className={`hover:text-tatvaani-orange transition-colors ${currentPage === 'contact' ? 'text-tatvaani-orange font-semibold' : 'text-gray-700'}`}
            >
              Contact
            </button>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button 
              onClick={() => setCurrentPage('cart')}
              className="relative text-gray-700 hover:text-tatvaani-orange transition-colors"
            >
              <i className="fas fa-shopping-cart text-xl"></i>
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-tatvaani-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-tatvaani-orange transition-colors">
                  <i className="fas fa-user"></i>
                  <span className="hidden md:inline">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {user.isAdmin && (
                    <button 
                      onClick={() => setCurrentPage('admin')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button 
                    onClick={() => setCurrentPage('orders')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Orders
                  </button>
                  <button 
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setCurrentPage('login')}
                className="bg-tatvaani-orange text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <button 
              onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }}
              className="block w-full text-left py-2 text-gray-700 hover:text-tatvaani-orange"
            >
              Home
            </button>
            <button 
              onClick={() => { setCurrentPage('products'); setIsMenuOpen(false); }}
              className="block w-full text-left py-2 text-gray-700 hover:text-tatvaani-orange"
            >
              Products
            </button>
            <button 
              onClick={() => { setCurrentPage('about'); setIsMenuOpen(false); }}
              className="block w-full text-left py-2 text-gray-700 hover:text-tatvaani-orange"
            >
              About
            </button>
            <button 
              onClick={() => { setCurrentPage('contact'); setIsMenuOpen(false); }}
              className="block w-full text-left py-2 text-gray-700 hover:text-tatvaani-orange"
            >
              Contact
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// Hero Section Component
const HeroSection = () => {
  const { setCurrentPage } = useAuth();

  return (
    <section className="bg-gradient-to-r from-tatvaani-teal to-tatvaani-orange text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to <span className="hindi-text">तत्वानि</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Discover the authentic essence of India through handcrafted products, 
            organic spices, and wellness treasures from local artisans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCurrentPage('products')}
              className="bg-white text-tatvaani-teal px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Explore Products
            </button>
            <button 
              onClick={() => setCurrentPage('about')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-tatvaani-teal transition-colors"
            >
              Our Story
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const { addToCart, setCurrentPage } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleProductClick = () => {
    setCurrentPage(`product-${product.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      <div className="relative">
        <img 
          src={product.image || "https://via.placeholder.com/300x200?text=Product+Image"} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 bg-tatvaani-red text-white px-2 py-1 rounded text-sm font-semibold">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <button 
              onClick={handleAddToCart}
              className="bg-tatvaani-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-tatvaani-teal">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
            )}
          </div>
          <div className="flex items-center text-yellow-500">
            <i className="fas fa-star text-sm"></i>
            <span className="text-sm text-gray-600 ml-1">{product.rating} ({product.reviews})</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <i className="fas fa-map-marker-alt mr-1"></i>
          {product.origin}
        </div>
      </div>
    </div>
  );
};

// Featured Products Section
const FeaturedProducts = () => {
  const { products } = useAuth();
  const featuredProducts = products.filter(p => p.featured);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Handpicked treasures from across India, each telling a story of tradition, 
            craftsmanship, and the rich cultural heritage of our artisans.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Home Page Component
const HomePage = () => {
  const { setCurrentPage } = useAuth();

  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Shop by Category</h2>
            <p className="text-gray-600">Discover authentic Indian products across our carefully curated categories</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setCurrentPage('products?category=Handicrafts')}>
              <img src="https://via.placeholder.com/400x250?text=Handicrafts" alt="Handicrafts" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-tatvaani-teal mb-2">Handicrafts</h3>
                <p className="text-gray-600">Exquisite handmade crafts from master artisans across India</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setCurrentPage('products?category=Spices & Food')}>
              <img src="https://via.placeholder.com/400x250?text=Spices+%26+Food" alt="Spices & Food" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-tatvaani-teal mb-2">Spices & Food</h3>
                <p className="text-gray-600">Organic spices and traditional foods from local farmers</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setCurrentPage('products?category=Wellness')}>
              <img src="https://via.placeholder.com/400x250?text=Wellness" alt="Wellness" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-tatvaani-teal mb-2">Wellness</h3>
                <p className="text-gray-600">Natural wellness products rooted in Ayurvedic traditions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Impact Section */}
      <section className="py-16 bg-tatvaani-teal text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Creating Social Impact</h2>
            <p className="text-xl mb-8 opacity-90">
              Every purchase supports the Shantidevi Foundation and empowers rural artisans 
              across India. Together, we're preserving traditions while building sustainable livelihoods.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div>Artisans Supported</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">₹50L+</div>
                <div>Donated to Foundation</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">25+</div>
                <div>Villages Impacted</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Stay Connected</h2>
            <p className="text-gray-600 mb-8">Get updates on new products, artisan stories, and exclusive offers</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
              />
              <button className="bg-tatvaani-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Products Page Component
const ProductsPage = () => {
  const { products } = useAuth();
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    origin: ''
  });

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const applyFilters = () => {
    let filtered = products;

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice));
    }

    if (filters.origin) {
      filtered = filtered.filter(p => p.origin.toLowerCase().includes(filters.origin.toLowerCase()));
    }

    setFilteredProducts(filtered);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      origin: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Products</h1>
          <p className="text-gray-600">Discover authentic Indian treasures handcrafted by skilled artisans</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
              >
                <option value="">All Categories</option>
                <option value="Handicrafts">Handicrafts</option>
                <option value="Spices & Food">Spices & Food</option>
                <option value="Wellness">Wellness</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                placeholder="Min ₹"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                placeholder="Max ₹"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more products</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Product Detail Page Component
const ProductDetailPage = ({ productId }) => {
  const { products, addToCart } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === productId);
    setProduct(foundProduct);
  }, [productId, products]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-tatvaani-orange mb-4"></i>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <div className="mb-4">
                <img 
                  src={product.images?.[selectedImage] || product.image || "https://via.placeholder.com/600x400?text=Product+Image"} 
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image || "https://via.placeholder.com/100x100?text=Image"}
                      alt={`${product.name} ${index + 1}`}
                      className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${selectedImage === index ? 'border-tatvaani-orange' : 'border-gray-200'}`}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center text-yellow-500 mr-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`fas fa-star ${i < Math.floor(product.rating) ? 'text-yellow-500' : 'text-gray-300'}`}></i>
                  ))}
                  <span className="text-gray-600 ml-2">{product.rating} ({product.reviews} reviews)</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-tatvaani-teal">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
                    <span className="bg-tatvaani-red text-white px-2 py-1 rounded text-sm font-semibold">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-700">Artisan:</span>
                  <p className="text-gray-600">{product.artisan}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Origin:</span>
                  <p className="text-gray-600">{product.origin}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Category:</span>
                  <p className="text-gray-600">{product.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Availability:</span>
                  <p className={`font-semibold ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>

              {product.inStock && (
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-tatvaani-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              )}

              {/* Social Sharing */}
              <div className="border-t pt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Share this product:</p>
                <div className="flex space-x-3">
                  <button className="text-blue-600 hover:text-blue-700">
                    <i className="fab fa-facebook-square text-2xl"></i>
                  </button>
                  <button className="text-blue-400 hover:text-blue-500">
                    <i className="fab fa-twitter-square text-2xl"></i>
                  </button>
                  <button className="text-green-600 hover:text-green-700">
                    <i className="fab fa-whatsapp-square text-2xl"></i>
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <i className="fab fa-pinterest-square text-2xl"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cart Page Component
const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, getCartTotal, setCurrentPage } = useAuth();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some amazing products to get started!</p>
          <button 
            onClick={() => setCurrentPage('products')}
            className="bg-tatvaani-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {cart.map(item => (
                <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.image || "https://via.placeholder.com/100x100?text=Product"} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                      <p className="text-gray-600 text-sm">{item.category}</p>
                      <p className="text-tatvaani-teal font-semibold">₹{item.price}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x border-gray-300">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{getCartTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-tatvaani-teal">₹{getCartTotal()}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setCurrentPage('checkout')}
                className="w-full bg-tatvaani-orange text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <button 
                onClick={() => setCurrentPage('products')}
                className="w-full mt-3 text-tatvaani-teal border border-tatvaani-teal py-3 rounded-lg font-semibold hover:bg-tatvaani-teal hover:text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Checkout Page Component
const CheckoutPage = () => {
  const { cart, getCartTotal, clearCart, setCurrentPage, user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart,
        total: getCartTotal(),
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod,
        orderDate: new Date().toISOString()
      };

      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearCart();
      setCurrentPage('order-success');
    } catch (error) {
      console.error('Order creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    setCurrentPage('cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Shipping Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <span>Online Payment</span>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-tatvaani-orange text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img 
                    src={item.image || "https://via.placeholder.com/60x60?text=Product"} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{getCartTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-tatvaani-teal">₹{getCartTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Page Component
const LoginPage = () => {
  const { login, register, setCurrentPage } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setCurrentPage('home');
        } else {
          setError(result.message);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          setCurrentPage('home');
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="bg-tatvaani-orange text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-user text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to your account' : 'Join the Tatvaani community'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
            />
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
              />
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-tatvaani-orange text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-tatvaani-orange font-semibold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// About Page Component
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-tatvaani-teal to-tatvaani-orange text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Our Story</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Tatvaani was born from a vision to preserve India's rich cultural heritage 
            while empowering local artisans and creating sustainable livelihoods.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                At Tatvaani, we believe in the power of authentic Indian craftsmanship. 
                Our mission is to connect conscious consumers with skilled artisans, 
                ensuring that traditional arts and crafts continue to thrive in the modern world.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Every product we offer tells a story of heritage, sustainability, and 
                the incredible talent of Indian craftspeople. Through fair trade practices 
                and direct partnerships, we ensure that artisans receive fair compensation 
                for their exceptional work.
              </p>
            </div>
            <div>
              <img 
                src="https://via.placeholder.com/600x400?text=Artisan+at+Work" 
                alt="Indian artisan at work"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do at Tatvaani
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-tatvaani-orange text-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-heart text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Authenticity</h3>
              <p className="text-gray-600">
                Every product is genuinely handcrafted using traditional methods 
                passed down through generations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-tatvaani-teal text-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-leaf text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Sustainability</h3>
              <p className="text-gray-600">
                We promote eco-friendly practices and sustainable materials 
                in all our products and operations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-tatvaani-red text-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-hands-helping text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Empowerment</h3>
              <p className="text-gray-600">
                We empower artisans by providing fair wages, skill development, 
                and market access for their beautiful creations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Impact Section */}
      <section className="py-16 bg-tatvaani-teal text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Creating Social Impact</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Through our partnership with the Shantidevi Foundation, we're making a real difference 
              in rural communities across India.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg">Artisans Supported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">₹50L+</div>
              <div className="text-lg">Donated to Foundation</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">25+</div>
              <div className="text-lg">Villages Impacted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-lg">Families Helped</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate individuals working to preserve and promote Indian heritage
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <img 
                src="https://via.placeholder.com/200x200?text=Founder" 
                alt="Founder"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Priya Sharma</h3>
              <p className="text-tatvaani-orange font-medium mb-3">Founder & CEO</p>
              <p className="text-gray-600 text-sm">
                With 15 years in sustainable business, Priya founded Tatvaani to create 
                meaningful connections between artisans and global markets.
              </p>
            </div>
            
            <div className="text-center">
              <img 
                src="https://via.placeholder.com/200x200?text=Curator" 
                alt="Chief Curator"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Rajesh Kumar</h3>
              <p className="text-tatvaani-orange font-medium mb-3">Chief Curator</p>
              <p className="text-gray-600 text-sm">
                A master craftsman himself, Rajesh ensures every product meets our 
                high standards of authenticity and quality.
              </p>
            </div>
            
            <div className="text-center">
              <img 
                src="https://via.placeholder.com/200x200?text=Impact" 
                alt="Impact Director"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Meera Patel</h3>
              <p className="text-tatvaani-orange font-medium mb-3">Impact Director</p>
              <p className="text-gray-600 text-sm">
                Meera leads our social impact initiatives and partnerships with 
                artisan communities and the Shantidevi Foundation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Contact Page Component
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send us a Message</h2>
            
            {submitted && (
              <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-tatvaani-orange text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-tatvaani-orange text-white p-3 rounded-full">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Address</h3>
                    <p className="text-gray-600">
                      123 Heritage Lane<br />
                      New Delhi, India 110001
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-tatvaani-teal text-white p-3 rounded-full">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
                    <p className="text-gray-600">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-tatvaani-red text-white p-3 rounded-full">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                    <p className="text-gray-600">hello@tatvaani.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-tatvaani-orange text-white p-3 rounded-full">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Follow Us</h2>
              <div className="flex space-x-4">
                <a href="#" className="text-blue-600 hover:text-blue-700 text-2xl">
                  <i className="fab fa-facebook-square"></i>
                </a>
                <a href="#" className="text-pink-600 hover:text-pink-700 text-2xl">
                  <i className="fab fa-instagram-square"></i>
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-500 text-2xl">
                  <i className="fab fa-twitter-square"></i>
                </a>
                <a href="#" className="text-red-600 hover:text-red-700 text-2xl">
                  <i className="fab fa-youtube-square"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Success Page
const OrderSuccessPage = () => {
  const { setCurrentPage } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="bg-green-100 text-green-600 p-6 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <i className="fas fa-check text-3xl"></i>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. We'll send you a confirmation email with your order details and tracking information.
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => setCurrentPage('orders')}
            className="w-full bg-tatvaani-orange text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            View My Orders
          </button>
          <button 
            onClick={() => setCurrentPage('products')}
            className="w-full text-tatvaani-teal border border-tatvaani-teal py-3 rounded-lg font-semibold hover:bg-tatvaani-teal hover:text-white transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

// Admin Panel Component
const AdminPanel = () => {
  const { user, products, setProducts } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-600">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'products' 
                    ? 'border-tatvaani-orange text-tatvaani-orange' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === 'orders' 
                    ? 'border-tatvaani-orange text-tatvaani-orange' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Manage Products</h2>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="bg-tatvaani-orange text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    Add New Product
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map(product => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                className="h-10 w-10 rounded object-cover" 
                                src={product.image || "https://via.placeholder.com/40x40?text=Product"} 
                                alt={product.name} 
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{product.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-tatvaani-orange hover:text-tatvaani-red mr-3"
                            >
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Orders</h2>
                <div className="text-center py-12">
                  <i className="fas fa-box text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">Order management coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  const { setCurrentPage } = useAuth();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-tatvaani-orange text-white p-2 rounded-full mr-3">
                <i className="fas fa-leaf"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold">Tatvaani</h3>
                <p className="text-sm text-gray-400 hindi-text">तत्वानि</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Preserving India's heritage through authentic handcrafted products 
              and sustainable artisan partnerships.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook-square text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram-square text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter-square text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-youtube-square text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('products')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('about')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('contact')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setCurrentPage('products?category=Handicrafts')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Handicrafts
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('products?category=Spices & Food')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Spices & Food
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('products?category=Wellness')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Wellness
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-tatvaani-orange mr-3"></i>
                <span className="text-gray-400 text-sm">
                  123 Heritage Lane, New Delhi, India 110001
                </span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-phone text-tatvaani-orange mr-3"></i>
                <span className="text-gray-400 text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-envelope text-tatvaani-orange mr-3"></i>
                <span className="text-gray-400 text-sm">hello@tatvaani.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Tatvaani - Essence of India. All rights reserved. | 
            Empowering artisans, preserving heritage.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  const { currentPage } = useAuth();

  const renderPage = () => {
    if (currentPage.startsWith('product-')) {
      const productId = currentPage.replace('product-', '');
      return <ProductDetailPage productId={productId} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'products':
        return <ProductsPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'login':
        return <LoginPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'admin':
        return <AdminPanel />;
      case 'order-success':
        return <OrderSuccessPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

// Render the App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AppProvider>
    <App />
  </AppProvider>
);
