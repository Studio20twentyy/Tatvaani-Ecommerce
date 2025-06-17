
const { useState, useEffect, createContext, useContext } = React;

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setCart([]);
    setCurrentPage('home');
  };

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  return (
    React.createElement(AuthContext.Provider, {
      value: {
        user,
        currentPage,
        setCurrentPage,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartTotal,
        getCartCount
      }
    }, children)
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Header Component
const Header = () => {
  const { user, logout, currentPage, setCurrentPage, getCartCount } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return React.createElement('header', {
    className: 'bg-white shadow-md sticky top-0 z-50'
  },
    React.createElement('div', {
      className: 'container mx-auto px-4'
    },
      React.createElement('div', {
        className: 'flex items-center justify-between py-4'
      },
        // Logo
        React.createElement('div', {
          className: 'flex items-center cursor-pointer',
          onClick: () => setCurrentPage('home')
        },
          React.createElement('img', {
            src: '/images/tatvaani-logo.png',
            alt: 'Tatvaani - Essence of India',
            className: 'h-16 w-auto mr-3'
          }),
          React.createElement('div', {
            className: 'hidden md:block'
          },
            React.createElement('h1', {
              className: 'text-2xl font-bold text-tatvaani-teal'
            }, 'Tatvaani'),
            React.createElement('p', {
              className: 'text-sm text-gray-600 hindi-text'
            }, 'तत्वानि - Essence of India')
          )
        ),

        // Desktop Navigation
        React.createElement('nav', {
          className: 'hidden md:flex items-center space-x-8'
        },
          React.createElement('button', {
            onClick: () => setCurrentPage('home'),
            className: `hover:text-tatvaani-orange transition-colors ${currentPage === 'home' ? 'text-tatvaani-orange font-semibold' : 'text-gray-700'}`
          }, 'Home'),
          React.createElement('button', {
            onClick: () => setCurrentPage('products'),
            className: `hover:text-tatvaani-orange transition-colors ${currentPage.startsWith('products') ? 'text-tatvaani-orange font-semibold' : 'text-gray-700'}`
          }, 'Products'),
          React.createElement('button', {
            onClick: () => setCurrentPage('about'),
            className: `hover:text-tatvaani-orange transition-colors ${currentPage === 'about' ? 'text-tatvaani-orange font-semibold' : 'text-gray-700'}`
          }, 'About'),
          React.createElement('button', {
            onClick: () => setCurrentPage('contact'),
            className: `hover:text-tatvaani-orange transition-colors ${currentPage === 'contact' ? 'text-tatvaani-orange font-semibold' : 'text-gray-700'}`
          }, 'Contact')
        ),

        // User Actions
        React.createElement('div', {
          className: 'flex items-center space-x-4'
        },
          // Cart
          React.createElement('button', {
            onClick: () => setCurrentPage('cart'),
            className: 'relative text-gray-700 hover:text-tatvaani-orange transition-colors'
          },
            React.createElement('i', { className: 'fas fa-shopping-cart text-xl' }),
            getCartCount() > 0 && React.createElement('span', {
              className: 'absolute -top-2 -right-2 bg-tatvaani-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'
            }, getCartCount())
          ),

          // User Menu
          user ? (
            React.createElement('div', {
              className: 'flex items-center space-x-4'
            },
              React.createElement('span', {
                className: 'text-gray-700'
              }, `Hello, ${user.name}`),
              React.createElement('button', {
                onClick: logout,
                className: 'bg-tatvaani-red text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors'
              }, 'Logout')
            )
          ) : (
            React.createElement('button', {
              onClick: () => setCurrentPage('login'),
              className: 'bg-tatvaani-orange text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors'
            }, 'Login')
          ),

          // Mobile Menu Toggle
          React.createElement('button', {
            onClick: () => setIsMenuOpen(!isMenuOpen),
            className: 'md:hidden text-gray-700'
          },
            React.createElement('i', { className: 'fas fa-bars text-xl' })
          )
        )
      ),

      // Mobile Menu
      isMenuOpen && React.createElement('div', {
        className: 'md:hidden bg-white border-t border-gray-200 py-4'
      },
        React.createElement('nav', {
          className: 'flex flex-col space-y-4'
        },
          React.createElement('button', {
            onClick: () => {
              setCurrentPage('home');
              setIsMenuOpen(false);
            },
            className: 'text-left text-gray-700 hover:text-tatvaani-orange transition-colors'
          }, 'Home'),
          React.createElement('button', {
            onClick: () => {
              setCurrentPage('products');
              setIsMenuOpen(false);
            },
            className: 'text-left text-gray-700 hover:text-tatvaani-orange transition-colors'
          }, 'Products'),
          React.createElement('button', {
            onClick: () => {
              setCurrentPage('about');
              setIsMenuOpen(false);
            },
            className: 'text-left text-gray-700 hover:text-tatvaani-orange transition-colors'
          }, 'About'),
          React.createElement('button', {
            onClick: () => {
              setCurrentPage('contact');
              setIsMenuOpen(false);
            },
            className: 'text-left text-gray-700 hover:text-tatvaani-orange transition-colors'
          }, 'Contact')
        )
      )
    )
  );
};

// Home Page Component
const HomePage = () => {
  const { setCurrentPage } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('/api/products/featured');
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return React.createElement('div', {},
    // Hero Section
    React.createElement('section', {
      className: 'bg-gradient-to-r from-tatvaani-teal via-tatvaani-green to-tatvaani-orange text-white py-20 relative overflow-hidden'
    },
      React.createElement('div', {
        className: 'absolute inset-0 bg-black bg-opacity-20'
      }),
      React.createElement('div', {
        className: 'container mx-auto px-4 text-center relative z-10'
      },
        React.createElement('img', {
          src: '/images/tatvaani-logo.png',
          alt: 'Tatvaani',
          className: 'h-32 w-auto mx-auto mb-6'
        }),
        React.createElement('p', {
          className: 'text-xl md:text-2xl mb-8 opacity-90'
        }, 'Essence of India\'s Rich Heritage'),
        React.createElement('p', {
          className: 'text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed'
        }, 'Discover authentic handcrafted treasures that tell stories of tradition, sustainability, and social impact. Every purchase supports rural artisans and provides education to underprivileged children.'),
        React.createElement('button', {
          onClick: () => setCurrentPage('products'),
          className: 'bg-white text-tatvaani-teal px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors shadow-lg'
        }, 'Explore Products')
      )
    ),

    // Social Impact Banner
    React.createElement('section', {
      className: 'bg-tatvaani-red text-white py-8'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4 text-center'
      },
        React.createElement('div', {
          className: 'flex items-center justify-center mb-4'
        },
          React.createElement('i', { className: 'fas fa-heart text-2xl mr-3' }),
          React.createElement('h2', {
            className: 'text-2xl font-bold'
          }, 'Every Purchase Creates Impact')
        ),
        React.createElement('p', {
          className: 'text-lg'
        }, 'Your purchase supports rural artisans and provides educational stationery kits to underprivileged children through our partnership with Shantidevi Foundation.')
      )
    ),

    // Featured Products
    React.createElement('section', {
      className: 'py-16 bg-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4'
      },
        React.createElement('div', {
          className: 'text-center mb-12'
        },
          React.createElement('h2', {
            className: 'text-4xl font-bold text-gray-800 mb-4'
          }, 'Featured Products'),
          React.createElement('p', {
            className: 'text-gray-600 max-w-2xl mx-auto'
          }, 'Handpicked treasures from master artisans across India')
        ),
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'
        },
          featuredProducts.map(product =>
            React.createElement('div', {
              key: product.id,
              className: 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer',
              onClick: () => setCurrentPage(`product/${product.id}`)
            },
              React.createElement('img', {
                src: product.image,
                alt: product.name,
                className: 'w-full h-48 object-cover'
              }),
              React.createElement('div', {
                className: 'p-6'
              },
                React.createElement('h3', {
                  className: 'text-lg font-semibold text-gray-800 mb-2'
                }, product.name),
                React.createElement('p', {
                  className: 'text-gray-600 text-sm mb-3'
                }, product.description),
                React.createElement('div', {
                  className: 'flex items-center justify-between'
                },
                  React.createElement('div', {},
                    React.createElement('span', {
                      className: 'text-lg font-bold text-tatvaani-orange'
                    }, `₹${product.price}`),
                    product.originalPrice && React.createElement('span', {
                      className: 'text-sm text-gray-500 line-through ml-2'
                    }, `₹${product.originalPrice}`)
                  ),
                  React.createElement('span', {
                    className: 'text-sm text-tatvaani-teal font-medium'
                  }, product.origin)
                )
              )
            )
          )
        ),
        React.createElement('div', {
          className: 'text-center mt-12'
        },
          React.createElement('button', {
            onClick: () => setCurrentPage('products'),
            className: 'bg-tatvaani-orange text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors'
          }, 'View All Products')
        )
      )
    ),

    // Categories Section
    React.createElement('section', {
      className: 'py-16 bg-tatvaani-light'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4'
      },
        React.createElement('div', {
          className: 'text-center mb-12'
        },
          React.createElement('h2', {
            className: 'text-4xl font-bold text-gray-800 mb-4'
          }, 'Explore Categories'),
          React.createElement('p', {
            className: 'text-gray-600 max-w-2xl mx-auto'
          }, 'Discover authentic products across different categories')
        ),
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-3 gap-8'
        },
          React.createElement('div', {
            className: 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer',
            onClick: () => setCurrentPage('products?category=Handicrafts')
          },
            React.createElement('img', {
              src: '/api/placeholder/400/250?text=Handicrafts',
              alt: 'Handicrafts',
              className: 'w-full h-48 object-cover'
            }),
            React.createElement('div', {
              className: 'p-6'
            },
              React.createElement('h3', {
                className: 'text-xl font-semibold text-tatvaani-teal mb-2'
              }, 'Handicrafts'),
              React.createElement('p', {
                className: 'text-gray-600'
              }, 'Traditional crafts and handmade treasures from skilled artisans')
            )
          ),
          React.createElement('div', {
            className: 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer',
            onClick: () => setCurrentPage('products?category=Spices & Food')
          },
            React.createElement('img', {
              src: '/api/placeholder/400/250?text=Spices+%26+Food',
              alt: 'Spices & Food',
              className: 'w-full h-48 object-cover'
            }),
            React.createElement('div', {
              className: 'p-6'
            },
              React.createElement('h3', {
                className: 'text-xl font-semibold text-tatvaani-teal mb-2'
              }, 'Spices & Food'),
              React.createElement('p', {
                className: 'text-gray-600'
              }, 'Organic spices and traditional foods from local farmers')
            )
          ),
          React.createElement('div', {
            className: 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer',
            onClick: () => setCurrentPage('products?category=Wellness')
          },
            React.createElement('img', {
              src: '/api/placeholder/400/250?text=Wellness',
              alt: 'Wellness',
              className: 'w-full h-48 object-cover'
            }),
            React.createElement('div', {
              className: 'p-6'
            },
              React.createElement('h3', {
                className: 'text-xl font-semibold text-tatvaani-teal mb-2'
              }, 'Wellness'),
              React.createElement('p', {
                className: 'text-gray-600'
              }, 'Natural wellness products rooted in Ayurvedic traditions')
            )
          )
        )
      )
    ),

    // Mission Section
    React.createElement('section', {
      className: 'py-16 bg-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4'
      },
        React.createElement('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
        },
          React.createElement('div', {},
            React.createElement('h2', {
              className: 'text-4xl font-bold text-gray-800 mb-6'
            }, 'Our Mission'),
            React.createElement('p', {
              className: 'text-gray-600 text-lg leading-relaxed mb-6'
            }, 'At Tatvaani, we believe in the power of authentic Indian craftsmanship. Our mission is to connect conscious consumers with skilled artisans, ensuring that traditional arts and crafts continue to thrive in the modern world.'),
            React.createElement('p', {
              className: 'text-gray-600 text-lg leading-relaxed mb-6'
            }, 'Every product we offer tells a story of heritage, sustainability, and the incredible talent of Indian craftspeople. Through fair trade practices and direct partnerships, we ensure that artisans receive fair compensation for their exceptional work.'),
            React.createElement('button', {
              onClick: () => setCurrentPage('about'),
              className: 'bg-tatvaani-teal text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors'
            }, 'Learn More About Us')
          ),
          React.createElement('div', {},
            React.createElement('img', {
              src: '/api/placeholder/600/400?text=Artisan+at+Work',
              alt: 'Indian artisan at work',
              className: 'w-full h-96 object-cover rounded-lg shadow-lg'
            })
          )
        )
      )
    )
  );
};

// Products Page Component
const ProductsPage = () => {
  const { addToCart, setCurrentPage } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    origin: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
        
        // Check for category filter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        if (category) {
          setFilters(prev => ({ ...prev, category }));
          setFilteredProducts(response.data.filter(p => p.category === category));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      filtered = filtered.filter(p =>
        p.origin.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const handleFilterChange = (key, value) => {
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

  if (loading) {
    return React.createElement('div', {
      className: 'flex items-center justify-center min-h-screen'
    },
      React.createElement('div', {
        className: 'text-center'
      },
        React.createElement('i', {
          className: 'fas fa-spinner fa-spin text-4xl text-tatvaani-orange mb-4'
        }),
        React.createElement('p', {
          className: 'text-gray-600'
        }, 'Loading products...')
      )
    );
  }

  return React.createElement('div', {
    className: 'container mx-auto px-4 py-8'
  },
    React.createElement('div', {
      className: 'mb-8'
    },
      React.createElement('h1', {
        className: 'text-4xl font-bold text-gray-800 mb-4'
      }, 'Our Products'),
      React.createElement('p', {
        className: 'text-gray-600 mb-6'
      }, 'Discover authentic handcrafted treasures from across India')
    ),

    // Filters
    React.createElement('div', {
      className: 'bg-white p-6 rounded-lg shadow-md mb-8'
    },
      React.createElement('h3', {
        className: 'text-lg font-semibold text-gray-800 mb-4'
      }, 'Filter Products'),
      React.createElement('div', {
        className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'
      },
        React.createElement('input', {
          type: 'text',
          placeholder: 'Search products...',
          value: filters.search,
          onChange: (e) => handleFilterChange('search', e.target.value),
          className: 'px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
        }),
        React.createElement('select', {
          value: filters.category,
          onChange: (e) => handleFilterChange('category', e.target.value),
          className: 'px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
        },
          React.createElement('option', { value: '' }, 'All Categories'),
          React.createElement('option', { value: 'Handicrafts' }, 'Handicrafts'),
          React.createElement('option', { value: 'Spices & Food' }, 'Spices & Food'),
          React.createElement('option', { value: 'Wellness' }, 'Wellness')
        ),
        React.createElement('input', {
          type: 'number',
          placeholder: 'Min Price',
          value: filters.minPrice,
          onChange: (e) => handleFilterChange('minPrice', e.target.value),
          className: 'px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
        }),
        React.createElement('input', {
          type: 'number',
          placeholder: 'Max Price',
          value: filters.maxPrice,
          onChange: (e) => handleFilterChange('maxPrice', e.target.value),
          className: 'px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
        })
      ),
      React.createElement('button', {
        onClick: clearFilters,
        className: 'bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors'
      }, 'Clear Filters')
    ),

    // Products Grid
    React.createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    },
      filteredProducts.map(product =>
        React.createElement('div', {
          key: product.id,
          className: 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'
        },
          React.createElement('img', {
            src: product.image,
            alt: product.name,
            className: 'w-full h-48 object-cover cursor-pointer',
            onClick: () => setCurrentPage(`product/${product.id}`)
          }),
          React.createElement('div', {
            className: 'p-4'
          },
            React.createElement('h3', {
              className: 'text-lg font-semibold text-gray-800 mb-2 cursor-pointer hover:text-tatvaani-orange',
              onClick: () => setCurrentPage(`product/${product.id}`)
            }, product.name),
            React.createElement('p', {
              className: 'text-gray-600 text-sm mb-2'
            }, product.description),
            React.createElement('p', {
              className: 'text-tatvaani-teal text-sm mb-3'
            }, product.origin),
            React.createElement('div', {
              className: 'flex items-center justify-between mb-3'
            },
              React.createElement('div', {},
                React.createElement('span', {
                  className: 'text-lg font-bold text-tatvaani-orange'
                }, `₹${product.price}`),
                product.originalPrice && React.createElement('span', {
                  className: 'text-sm text-gray-500 line-through ml-2'
                }, `₹${product.originalPrice}`)
              ),
              product.rating && React.createElement('div', {
                className: 'flex items-center'
              },
                React.createElement('i', { className: 'fas fa-star text-yellow-400 text-sm' }),
                React.createElement('span', {
                  className: 'text-sm text-gray-600 ml-1'
                }, product.rating)
              )
            ),
            React.createElement('button', {
              onClick: () => addToCart(product),
              className: 'w-full bg-tatvaani-orange text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors'
            }, 'Add to Cart')
          )
        )
      )
    ),

    filteredProducts.length === 0 && React.createElement('div', {
      className: 'text-center py-12'
    },
      React.createElement('i', {
        className: 'fas fa-search text-6xl text-gray-300 mb-4'
      }),
      React.createElement('h3', {
        className: 'text-xl text-gray-600 mb-2'
      }, 'No products found'),
      React.createElement('p', {
        className: 'text-gray-500'
      }, 'Try adjusting your filters or search terms')
    )
  );
};

// Product Detail Component
const ProductDetail = ({ productId }) => {
  const { addToCart } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return React.createElement('div', {
      className: 'flex items-center justify-center min-h-screen'
    },
      React.createElement('div', {
        className: 'text-center'
      },
        React.createElement('i', {
          className: 'fas fa-spinner fa-spin text-4xl text-tatvaani-orange mb-4'
        }),
        React.createElement('p', {
          className: 'text-gray-600'
        }, 'Loading product...')
      )
    );
  }

  if (!product) {
    return React.createElement('div', {
      className: 'container mx-auto px-4 py-8 text-center'
    },
      React.createElement('h2', {
        className: 'text-2xl font-bold text-gray-800 mb-4'
      }, 'Product not found'),
      React.createElement('p', {
        className: 'text-gray-600'
      }, 'The product you are looking for does not exist.')
    );
  }

  return React.createElement('div', {
    className: 'container mx-auto px-4 py-8'
  },
    React.createElement('div', {
      className: 'grid grid-cols-1 lg:grid-cols-2 gap-12'
    },
      // Product Images
      React.createElement('div', {},
        React.createElement('img', {
          src: product.image,
          alt: product.name,
          className: 'w-full h-96 object-cover rounded-lg shadow-lg mb-4'
        }),
        product.images && product.images.length > 1 && React.createElement('div', {
          className: 'grid grid-cols-2 gap-4'
        },
          product.images.slice(1).map((image, index) =>
            React.createElement('img', {
              key: index,
              src: image,
              alt: `${product.name} ${index + 2}`,
              className: 'w-full h-32 object-cover rounded-lg'
            })
          )
        )
      ),

      // Product Info
      React.createElement('div', {},
        React.createElement('h1', {
          className: 'text-3xl font-bold text-gray-800 mb-4'
        }, product.name),
        React.createElement('p', {
          className: 'text-tatvaani-teal text-lg mb-4'
        }, product.origin),
        React.createElement('div', {
          className: 'flex items-center mb-4'
        },
          React.createElement('span', {
            className: 'text-2xl font-bold text-tatvaani-orange'
          }, `₹${product.price}`),
          product.originalPrice && React.createElement('span', {
            className: 'text-lg text-gray-500 line-through ml-3'
          }, `₹${product.originalPrice}`),
          product.originalPrice && React.createElement('span', {
            className: 'text-sm text-green-600 ml-3 bg-green-100 px-2 py-1 rounded'
          }, `${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`)
        ),
        
        product.rating && React.createElement('div', {
          className: 'flex items-center mb-6'
        },
          React.createElement('div', {
            className: 'flex items-center mr-4'
          },
            Array.from({ length: 5 }, (_, i) =>
              React.createElement('i', {
                key: i,
                className: `fas fa-star ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`
              })
            ),
            React.createElement('span', {
              className: 'ml-2 text-gray-600'
            }, `${product.rating} (${product.reviews} reviews)`)
          )
        ),

        React.createElement('p', {
          className: 'text-gray-600 text-lg leading-relaxed mb-6'
        }, product.longDescription || product.description),

        product.features && React.createElement('div', {
          className: 'mb-6'
        },
          React.createElement('h3', {
            className: 'text-lg font-semibold text-gray-800 mb-3'
          }, 'Features'),
          React.createElement('ul', {
            className: 'list-disc list-inside text-gray-600 space-y-1'
          },
            product.features.map((feature, index) =>
              React.createElement('li', { key: index }, feature)
            )
          )
        ),

        React.createElement('div', {
          className: 'mb-6'
        },
          React.createElement('h3', {
            className: 'text-lg font-semibold text-gray-800 mb-2'
          }, 'Artisan'),
          React.createElement('p', {
            className: 'text-gray-600'
          }, product.artisan)
        ),

        // Quantity and Add to Cart
        React.createElement('div', {
          className: 'flex items-center space-x-4 mb-6'
        },
          React.createElement('div', {
            className: 'flex items-center border border-gray-300 rounded-lg'
          },
            React.createElement('button', {
              onClick: () => setQuantity(Math.max(1, quantity - 1)),
              className: 'px-3 py-2 text-gray-600 hover:bg-gray-100'
            }, '-'),
            React.createElement('span', {
              className: 'px-4 py-2 min-w-[3rem] text-center'
            }, quantity),
            React.createElement('button', {
              onClick: () => setQuantity(quantity + 1),
              className: 'px-3 py-2 text-gray-600 hover:bg-gray-100'
            }, '+')
          ),
          React.createElement('button', {
            onClick: () => addToCart(product, quantity),
            className: 'flex-1 bg-tatvaani-orange text-white py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors font-semibold'
          }, 'Add to Cart')
        ),

        // Social Impact Message
        React.createElement('div', {
          className: 'bg-tatvaani-light p-4 rounded-lg border-l-4 border-tatvaani-red'
        },
          React.createElement('div', {
            className: 'flex items-center mb-2'
          },
            React.createElement('i', { className: 'fas fa-heart text-tatvaani-red mr-2' }),
            React.createElement('h4', {
              className: 'font-semibold text-gray-800'
            }, 'Creating Impact')
          ),
          React.createElement('p', {
            className: 'text-gray-600 text-sm'
          }, 'Your purchase supports the artisan who made this product and provides educational stationery to underprivileged children through Shantidevi Foundation.')
        )
      )
    )
  );
};

// Cart Component
const CartPage = () => {
  const { cart, updateCartQuantity, removeFromCart, getCartTotal, user, setCurrentPage } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      setCurrentPage('login');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart,
        total: getCartTotal(),
        shippingAddress: 'Default Address' // In a real app, you'd collect this
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Order placed successfully!');
      // Clear cart
      localStorage.removeItem('cart');
      setCurrentPage('home');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return React.createElement('div', {
      className: 'container mx-auto px-4 py-8 text-center'
    },
      React.createElement('div', {
        className: 'max-w-md mx-auto'
      },
        React.createElement('i', {
          className: 'fas fa-shopping-cart text-6xl text-gray-300 mb-4'
        }),
        React.createElement('h2', {
          className: 'text-2xl font-bold text-gray-800 mb-4'
        }, 'Your Cart is Empty'),
        React.createElement('p', {
          className: 'text-gray-600 mb-6'
        }, 'Discover amazing handcrafted products from across India'),
        React.createElement('button', {
          onClick: () => setCurrentPage('products'),
          className: 'bg-tatvaani-orange text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors'
        }, 'Continue Shopping')
      )
    );
  }

  return React.createElement('div', {
    className: 'container mx-auto px-4 py-8'
  },
    React.createElement('h1', {
      className: 'text-3xl font-bold text-gray-800 mb-8'
    }, 'Shopping Cart'),

    React.createElement('div', {
      className: 'grid grid-cols-1 lg:grid-cols-3 gap-8'
    },
      // Cart Items
      React.createElement('div', {
        className: 'lg:col-span-2'
      },
        React.createElement('div', {
          className: 'bg-white rounded-lg shadow-md overflow-hidden'
        },
          cart.map(item =>
            React.createElement('div', {
              key: item.id,
              className: 'p-6 border-b border-gray-200 last:border-b-0'
            },
              React.createElement('div', {
                className: 'flex items-center space-x-4'
              },
                React.createElement('img', {
                  src: item.image,
                  alt: item.name,
                  className: 'w-20 h-20 object-cover rounded-lg'
                }),
                React.createElement('div', {
                  className: 'flex-1'
                },
                  React.createElement('h3', {
                    className: 'text-lg font-semibold text-gray-800'
                  }, item.name),
                  React.createElement('p', {
                    className: 'text-gray-600 text-sm'
                  }, item.origin),
                  React.createElement('p', {
                    className: 'text-tatvaani-orange font-semibold'
                  }, `₹${item.price}`)
                ),
                React.createElement('div', {
                  className: 'flex items-center space-x-2'
                },
                  React.createElement('button', {
                    onClick: () => updateCartQuantity(item.id, item.quantity - 1),
                    className: 'w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100'
                  }, '-'),
                  React.createElement('span', {
                    className: 'w-8 text-center'
                  }, item.quantity),
                  React.createElement('button', {
                    onClick: () => updateCartQuantity(item.id, item.quantity + 1),
                    className: 'w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100'
                  }, '+')
                ),
                React.createElement('button', {
                  onClick: () => removeFromCart(item.id),
                  className: 'text-red-500 hover:text-red-700 p-2'
                },
                  React.createElement('i', { className: 'fas fa-trash' })
                )
              )
            )
          )
        )
      ),

      // Order Summary
      React.createElement('div', {},
        React.createElement('div', {
          className: 'bg-white rounded-lg shadow-md p-6 sticky top-24'
        },
          React.createElement('h3', {
            className: 'text-lg font-semibold text-gray-800 mb-4'
          }, 'Order Summary'),
          React.createElement('div', {
            className: 'space-y-2 mb-4'
          },
            React.createElement('div', {
              className: 'flex justify-between'
            },
              React.createElement('span', {}, 'Subtotal'),
              React.createElement('span', {}, `₹${getCartTotal()}`)
            ),
            React.createElement('div', {
              className: 'flex justify-between'
            },
              React.createElement('span', {}, 'Shipping'),
              React.createElement('span', {}, 'Free')
            ),
            React.createElement('div', {
              className: 'border-t pt-2 flex justify-between font-semibold'
            },
              React.createElement('span', {}, 'Total'),
              React.createElement('span', {}, `₹${getCartTotal()}`)
            )
          ),
          React.createElement('button', {
            onClick: handleCheckout,
            disabled: loading,
            className: 'w-full bg-tatvaani-orange text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors font-semibold disabled:opacity-50'
          }, loading ? 'Processing...' : 'Proceed to Checkout'),
          
          // Impact Message
          React.createElement('div', {
            className: 'mt-6 p-4 bg-tatvaani-light rounded-lg border-l-4 border-tatvaani-red'
          },
            React.createElement('div', {
              className: 'flex items-center mb-2'
            },
              React.createElement('i', { className: 'fas fa-heart text-tatvaani-red mr-2' }),
              React.createElement('h4', {
                className: 'font-semibold text-gray-800 text-sm'
              }, 'Creating Impact')
            ),
            React.createElement('p', {
              className: 'text-gray-600 text-xs'
            }, 'Your order supports artisan communities and provides educational materials to children in need.')
          )
        )
      )
    )
  );
};

// About Page Component
const AboutPage = () => {
  const { setCurrentPage } = useAuth();

  return React.createElement('div', {},
    // Hero Section
    React.createElement('section', {
      className: 'bg-gradient-to-r from-tatvaani-teal to-tatvaani-orange text-white py-16'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4 text-center'
      },
        React.createElement('h1', {
          className: 'text-5xl font-bold mb-4'
        }, 'About Tatvaani'),
        React.createElement('p', {
          className: 'text-xl max-w-3xl mx-auto'
        }, 'Preserving India\'s heritage through authentic handcrafted products and sustainable artisan partnerships')
      )
    ),

    // Story Section
    React.createElement('section', {
      className: 'py-16 bg-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4'
      },
        React.createElement('div', {
          className: 'max-w-4xl mx-auto text-center'
        },
          React.createElement('h2', {
            className: 'text-4xl font-bold text-gray-800 mb-8'
          }, 'Our Story'),
          React.createElement('p', {
            className: 'text-gray-600 text-lg leading-relaxed mb-6'
          }, 'Tatvaani was born from a deep love for India\'s rich cultural heritage and a commitment to preserving traditional craftsmanship. We recognized that many skilled artisans, despite their extraordinary talents, struggled to reach wider markets and receive fair compensation for their work.'),
          React.createElement('p', {
            className: 'text-gray-600 text-lg leading-relaxed'
          }, 'Our platform bridges this gap by connecting conscious consumers with authentic, handcrafted products while ensuring that artisans receive fair wages and recognition for their exceptional skills. Every product on Tatvaani tells a story of tradition, sustainability, and social impact.')
        )
      )
    ),

    // Mission Section
    React.createElement('section', {
      className: 'py-16 bg-tatvaani-light'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4'
      },
        React.createElement('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
        },
          React.createElement('div', {},
            React.createElement('h2', {
              className: 'text-4xl font-bold text-gray-800 mb-6'
            }, 'Our Mission'),
            React.createElement('p', {
              className: 'text-gray-600 text-lg leading-relaxed mb-6'
            }, 'At Tatvaani, we believe in the power of authentic Indian craftsmanship. Our mission is to connect conscious consumers with skilled artisans, ensuring that traditional arts and crafts continue to thrive in the modern world.'),
            React.createElement('p', {
              className: 'text-gray-600 text-lg leading-relaxed'
            }, 'Every product we offer tells a story of heritage, sustainability, and the incredible talent of Indian craftspeople. Through fair trade practices and direct partnerships, we ensure that artisans receive fair compensation for their exceptional work.')
          ),
          React.createElement('div', {},
            React.createElement('img', {
              src: '/api/placeholder/600/400?text=Artisan+at+Work',
              alt: 'Indian artisan at work',
              className: 'w-full h-96 object-cover rounded-lg shadow-lg'
            })
          )
        )
      )
    ),

    // Values Section
    React.createElement('section', {
      className: 'py-16 bg-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4'
      },
        React.createElement('div', {
          className: 'text-center mb-12'
        },
          React.createElement('h2', {
            className: 'text-4xl font-bold text-gray-800 mb-4'
          }, 'Our Values'),
          React.createElement('p', {
            className: 'text-gray-600 max-w-2xl mx-auto'
          }, 'These core principles guide everything we do at Tatvaani')
        ),
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-3 gap-8'
        },
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('div', {
              className: 'bg-tatvaani-orange text-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'
            },
              React.createElement('i', { className: 'fas fa-heart text-2xl' })
            ),
            React.createElement('h3', {
              className: 'text-xl font-semibold text-gray-800 mb-3'
            }, 'Authenticity'),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'Every product is genuinely handcrafted using traditional methods passed down through generations.')
          ),
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('div', {
              className: 'bg-tatvaani-teal text-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'
            },
              React.createElement('i', { className: 'fas fa-leaf text-2xl' })
            ),
            React.createElement('h3', {
              className: 'text-xl font-semibold text-gray-800 mb-3'
            }, 'Sustainability'),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'We promote eco-friendly practices and sustainable materials in all our products and operations.')
          ),
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('div', {
              className: 'bg-tatvaani-red text-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'
            },
              React.createElement('i', { className: 'fas fa-hands-helping text-2xl' })
            ),
            React.createElement('h3', {
              className: 'text-xl font-semibold text-gray-800 mb-3'
            }, 'Empowerment'),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'We empower artisans by providing fair wages, skill development, and market access for their beautiful creations.')
          )
        )
      )
    ),

    // Impact Section
    React.createElement('section', {
      className: 'py-16 bg-tatvaani-red text-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4'
      },
        React.createElement('div', {
          className: 'text-center mb-12'
        },
          React.createElement('h2', {
            className: 'text-4xl font-bold mb-4'
          }, 'Our Social Impact'),
          React.createElement('p', {
            className: 'text-xl max-w-3xl mx-auto'
          }, 'Through our partnership with Shantidevi Foundation, every purchase creates positive change')
        ),
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto'
        },
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('div', {
              className: 'text-4xl font-bold mb-2'
            }, '500+'),
            React.createElement('p', {
              className: 'text-lg'
            }, 'Artisans Supported')
          ),
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('div', {
              className: 'text-4xl font-bold mb-2'
            }, '1000+'),
            React.createElement('p', {
              className: 'text-lg'
            }, 'Children Educated')
          ),
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('div', {
              className: 'text-4xl font-bold mb-2'
            }, '50+'),
            React.createElement('p', {
              className: 'text-lg'
            }, 'Communities Reached')
          )
        )
      )
    ),

    // Team Section
    React.createElement('section', {
      className: 'py-16 bg-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4'
      },
        React.createElement('div', {
          className: 'text-center mb-12'
        },
          React.createElement('h2', {
            className: 'text-4xl font-bold text-gray-800 mb-4'
          }, 'Our Team'),
          React.createElement('p', {
            className: 'text-gray-600 max-w-2xl mx-auto'
          }, 'Meet the passionate individuals working to preserve India\'s heritage')
        ),
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto'
        },
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('img', {
              src: '/api/placeholder/200/200?text=Founder',
              alt: 'Founder',
              className: 'w-32 h-32 rounded-full mx-auto mb-4 object-cover'
            }),
            React.createElement('h3', {
              className: 'text-xl font-semibold text-gray-800 mb-2'
            }, 'Priya Sharma'),
            React.createElement('p', {
              className: 'text-tatvaani-orange font-medium mb-3'
            }, 'Founder & CEO'),
            React.createElement('p', {
              className: 'text-gray-600 text-sm'
            }, 'A passionate advocate for traditional crafts with 15 years of experience in social entrepreneurship.')
          ),
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('img', {
              src: '/api/placeholder/200/200?text=Curator',
              alt: 'Chief Curator',
              className: 'w-32 h-32 rounded-full mx-auto mb-4 object-cover'
            }),
            React.createElement('h3', {
              className: 'text-xl font-semibold text-gray-800 mb-2'
            }, 'Rajesh Kumar'),
            React.createElement('p', {
              className: 'text-tatvaani-orange font-medium mb-3'
            }, 'Chief Curator'),
            React.createElement('p', {
              className: 'text-gray-600 text-sm'
            }, 'A master craftsman himself, Rajesh ensures every product meets our high standards of authenticity and quality.')
          ),
          React.createElement('div', {
            className: 'text-center'
          },
            React.createElement('img', {
              src: '/api/placeholder/200/200?text=Impact',
              alt: 'Impact Director',
              className: 'w-32 h-32 rounded-full mx-auto mb-4 object-cover'
            }),
            React.createElement('h3', {
              className: 'text-xl font-semibold text-gray-800 mb-2'
            }, 'Meera Patel'),
            React.createElement('p', {
              className: 'text-tatvaani-orange font-medium mb-3'
            }, 'Impact Director'),
            React.createElement('p', {
              className: 'text-gray-600 text-sm'
            }, 'Meera leads our social impact initiatives and partnerships with artisan communities and the Shantidevi Foundation.')
          )
        )
      )
    ),

    // CTA Section
    React.createElement('section', {
      className: 'py-16 bg-tatvaani-light'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4 text-center'
      },
        React.createElement('h2', {
          className: 'text-4xl font-bold text-gray-800 mb-4'
        }, 'Join Our Mission'),
        React.createElement('p', {
          className: 'text-gray-600 text-lg mb-8 max-w-2xl mx-auto'
        }, 'Be part of preserving India\'s heritage while creating positive social impact. Every purchase makes a difference.'),
        React.createElement('button', {
          onClick: () => setCurrentPage('products'),
          className: 'bg-tatvaani-orange text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors'
        }, 'Explore Products')
      )
    )
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
      alert('Thank you for your message! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', {},
    // Hero Section
    React.createElement('section', {
      className: 'bg-gradient-to-r from-tatvaani-teal to-tatvaani-orange text-white py-16'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4 text-center'
      },
        React.createElement('h1', {
          className: 'text-5xl font-bold mb-4'
        }, 'Contact Us'),
        React.createElement('p', {
          className: 'text-xl max-w-2xl mx-auto'
        }, 'We\'d love to hear from you. Get in touch with any questions or feedback.')
      )
    ),

    // Contact Form and Info
    React.createElement('section', {
      className: 'py-16 bg-white'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4'
      },
        React.createElement('div', {
          className: 'grid grid-cols-1 lg:grid-cols-2 gap-12'
        },
          // Contact Form
          React.createElement('div', {},
            React.createElement('h2', {
              className: 'text-3xl font-bold text-gray-800 mb-6'
            }, 'Send us a Message'),
            React.createElement('form', {
              onSubmit: handleSubmit,
              className: 'space-y-6'
            },
              React.createElement('div', {
                className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
              },
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Name'),
                  React.createElement('input', {
                    type: 'text',
                    name: 'name',
                    value: formData.name,
                    onChange: handleInputChange,
                    required: true,
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
                  })
                ),
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Email'),
                  React.createElement('input', {
                    type: 'email',
                    name: 'email',
                    value: formData.email,
                    onChange: handleInputChange,
                    required: true,
                    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
                  })
                )
              ),
              React.createElement('div', {},
                React.createElement('label', {
                  className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Subject'),
                React.createElement('input', {
                  type: 'text',
                  name: 'subject',
                  value: formData.subject,
                  onChange: handleInputChange,
                  required: true,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', {
                  className: 'block text-sm font-medium text-gray-700 mb-2'
                }, 'Message'),
                React.createElement('textarea', {
                  name: 'message',
                  value: formData.message,
                  onChange: handleInputChange,
                  required: true,
                  rows: 6,
                  className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange resize-none'
                })
              ),
              React.createElement('button', {
                type: 'submit',
                disabled: loading,
                className: 'w-full bg-tatvaani-orange text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50'
              }, loading ? 'Sending...' : 'Send Message')
            )
          ),

          // Contact Information
          React.createElement('div', {},
            React.createElement('h2', {
              className: 'text-3xl font-bold text-gray-800 mb-6'
            }, 'Get in Touch'),
            React.createElement('div', {
              className: 'space-y-6'
            },
              React.createElement('div', {
                className: 'flex items-start space-x-4'
              },
                React.createElement('div', {
                  className: 'bg-tatvaani-orange text-white p-3 rounded-full'
                },
                  React.createElement('i', { className: 'fas fa-map-marker-alt' })
                ),
                React.createElement('div', {},
                  React.createElement('h3', {
                    className: 'font-semibold text-gray-800 mb-1'
                  }, 'Address'),
                  React.createElement('p', {
                    className: 'text-gray-600'
                  }, '123 Heritage Street, Artisan Quarter, New Delhi, India - 110001')
                )
              ),
              React.createElement('div', {
                className: 'flex items-start space-x-4'
              },
                React.createElement('div', {
                  className: 'bg-tatvaani-orange text-white p-3 rounded-full'
                },
                  React.createElement('i', { className: 'fas fa-phone' })
                ),
                React.createElement('div', {},
                  React.createElement('h3', {
                    className: 'font-semibold text-gray-800 mb-1'
                  }, 'Phone'),
                  React.createElement('p', {
                    className: 'text-gray-600'
                  }, '+91 98765 43210')
                )
              ),
              React.createElement('div', {
                className: 'flex items-start space-x-4'
              },
                React.createElement('div', {
                  className: 'bg-tatvaani-orange text-white p-3 rounded-full'
                },
                  React.createElement('i', { className: 'fas fa-envelope' })
                ),
                React.createElement('div', {},
                  React.createElement('h3', {
                    className: 'font-semibold text-gray-800 mb-1'
                  }, 'Email'),
                  React.createElement('p', {
                    className: 'text-gray-600'
                  }, 'hello@tatvaani.com')
                )
              ),
              React.createElement('div', {
                className: 'flex items-start space-x-4'
              },
                React.createElement('div', {
                  className: 'bg-tatvaani-orange text-white p-3 rounded-full'
                },
                  React.createElement('i', { className: 'fas fa-clock' })
                ),
                React.createElement('div', {},
                  React.createElement('h3', {
                    className: 'font-semibold text-gray-800 mb-1'
                  }, 'Business Hours'),
                  React.createElement('p', {
                    className: 'text-gray-600'
                  }, 'Monday - Friday: 9:00 AM - 6:00 PM'),
                  React.createElement('p', {
                    className: 'text-gray-600'
                  }, 'Saturday: 10:00 AM - 4:00 PM'),
                  React.createElement('p', {
                    className: 'text-gray-600'
                  }, 'Sunday: Closed')
                )
              )
            ),

            // Social Media
            React.createElement('div', {
              className: 'mt-8'
            },
              React.createElement('h3', {
                className: 'font-semibold text-gray-800 mb-4'
              }, 'Follow Us'),
              React.createElement('div', {
                className: 'flex space-x-4'
              },
                React.createElement('a', {
                  href: '#',
                  className: 'bg-tatvaani-orange text-white p-3 rounded-full hover:bg-opacity-90 transition-colors'
                },
                  React.createElement('i', { className: 'fab fa-facebook-f' })
                ),
                React.createElement('a', {
                  href: '#',
                  className: 'bg-tatvaani-orange text-white p-3 rounded-full hover:bg-opacity-90 transition-colors'
                },
                  React.createElement('i', { className: 'fab fa-instagram' })
                ),
                React.createElement('a', {
                  href: '#',
                  className: 'bg-tatvaani-orange text-white p-3 rounded-full hover:bg-opacity-90 transition-colors'
                },
                  React.createElement('i', { className: 'fab fa-twitter' })
                ),
                React.createElement('a', {
                  href: '#',
                  className: 'bg-tatvaani-orange text-white p-3 rounded-full hover:bg-opacity-90 transition-colors'
                },
                  React.createElement('i', { className: 'fab fa-youtube' })
                )
              )
            )
          )
        )
      )
    )
  );
};

// Login/Register Component
const AuthPage = () => {
  const { login, setCurrentPage } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
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
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await axios.post(endpoint, formData);
      
      login(response.data.user, response.data.token);
      setCurrentPage('home');
    } catch (error) {
      console.error('Auth error:', error);
      alert(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', {
    className: 'min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4'
  },
    React.createElement('div', {
      className: 'max-w-md w-full bg-white rounded-lg shadow-md p-8'
    },
      React.createElement('div', {
        className: 'text-center mb-8'
      },
        React.createElement('img', {
          src: '/images/tatvaani-logo.png',
          alt: 'Tatvaani',
          className: 'h-20 w-auto mx-auto mb-4'
        }),
        React.createElement('h2', {
          className: 'text-2xl font-bold text-gray-800'
        }, isLogin ? 'Welcome Back' : 'Create Account'),
        React.createElement('p', {
          className: 'text-gray-600 mt-2'
        }, isLogin ? 'Sign in to your account' : 'Join the Tatvaani community')
      ),

      React.createElement('form', {
        onSubmit: handleSubmit
      },
        !isLogin && React.createElement('div', {
          className: 'mb-4'
        },
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'Full Name'),
          React.createElement('input', {
            type: 'text',
            name: 'name',
            value: formData.name,
            onChange: handleInputChange,
            required: true,
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
          })
        ),
        React.createElement('div', {
          className: 'mb-4'
        },
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'Email Address'),
          React.createElement('input', {
            type: 'email',
            name: 'email',
            value: formData.email,
            onChange: handleInputChange,
            required: true,
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
          })
        ),
        React.createElement('div', {
          className: 'mb-6'
        },
          React.createElement('label', {
            className: 'block text-sm font-medium text-gray-700 mb-2'
          }, 'Password'),
          React.createElement('input', {
            type: 'password',
            name: 'password',
            value: formData.password,
            onChange: handleInputChange,
            required: true,
            className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tatvaani-orange'
          })
        ),
        React.createElement('button', {
          type: 'submit',
          disabled: loading,
          className: 'w-full bg-tatvaani-orange text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50'
        }, loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account'))
      ),

      React.createElement('div', {
        className: 'mt-6 text-center'
      },
        React.createElement('p', {
          className: 'text-gray-600'
        },
          isLogin ? "Don't have an account? " : "Already have an account? ",
          React.createElement('button', {
            onClick: () => setIsLogin(!isLogin),
            className: 'text-tatvaani-orange hover:underline font-medium'
          }, isLogin ? 'Sign up' : 'Sign in')
        )
      )
    )
  );
};

// Footer Component
const Footer = () => {
  const { setCurrentPage } = useAuth();

  return React.createElement('footer', {
    className: 'bg-gray-800 text-white'
  },
    React.createElement('div', {
      className: 'container mx-auto px-4 py-12'
    },
      React.createElement('div', {
        className: 'grid grid-cols-1 md:grid-cols-4 gap-8'
      },
        // Company Info
        React.createElement('div', {},
          React.createElement('div', {
            className: 'flex items-center mb-4'
          },
            React.createElement('img', {
              src: '/images/tatvaani-logo.png',
              alt: 'Tatvaani',
              className: 'h-12 w-auto mr-3'
            })
          ),
          React.createElement('p', {
            className: 'text-gray-400 mb-4'
          }, 'Preserving India\'s heritage through authentic handcrafted products and sustainable artisan partnerships.'),
          React.createElement('div', {
            className: 'flex space-x-3'
          },
            React.createElement('a', {
              href: '#',
              className: 'text-gray-400 hover:text-white'
            },
              React.createElement('i', { className: 'fab fa-facebook-square text-xl' })
            ),
            React.createElement('a', {
              href: '#',
              className: 'text-gray-400 hover:text-white'
            },
              React.createElement('i', { className: 'fab fa-instagram-square text-xl' })
            ),
            React.createElement('a', {
              href: '#',
              className: 'text-gray-400 hover:text-white'
            },
              React.createElement('i', { className: 'fab fa-twitter-square text-xl' })
            ),
            React.createElement('a', {
              href: '#',
              className: 'text-gray-400 hover:text-white'
            },
              React.createElement('i', { className: 'fab fa-youtube-square text-xl' })
            )
          )
        ),

        // Quick Links
        React.createElement('div', {},
          React.createElement('h4', {
            className: 'text-lg font-semibold mb-4'
          }, 'Quick Links'),
          React.createElement('ul', {
            className: 'space-y-2'
          },
            React.createElement('li', {},
              React.createElement('button', {
                onClick: () => setCurrentPage('home'),
                className: 'text-gray-400 hover:text-white transition-colors'
              }, 'Home')
            ),
            React.createElement('li', {},
              React.createElement('button', {
                onClick: () => setCurrentPage('products'),
                className: 'text-gray-400 hover:text-white transition-colors'
              }, 'Products')
            ),
            React.createElement('li', {},
              React.createElement('button', {
                onClick: () => setCurrentPage('about'),
                className: 'text-gray-400 hover:text-white transition-colors'
              }, 'About')
            ),
            React.createElement('li', {},
              React.createElement('button', {
                onClick: () => setCurrentPage('contact'),
                className: 'text-gray-400 hover:text-white transition-colors'
              }, 'Contact')
            )
          )
        ),

        // Categories
        React.createElement('div', {},
          React.createElement('h4', {
            className: 'text-lg font-semibold mb-4'
          }, 'Categories'),
          React.createElement('ul', {
            className: 'space-y-2'
          },
            React.createElement('li', {},
              React.createElement('button', {
                onClick: () => setCurrentPage('products?category=Handicrafts'),
                className: 'text-gray-400 hover:text-white transition-colors'
              }, 'Handicrafts')
            ),
            React.createElement('li', {},
              React.createElement('button', {
                onClick: () => setCurrentPage('products?category=Spices & Food'),
                className: 'text-gray-400 hover:text-white transition-colors'
              }, 'Spices & Food')
            ),
            React.createElement('li', {},
              React.createElement('button', {
                onClick: () => setCurrentPage('products?category=Wellness'),
                className: 'text-gray-400 hover:text-white transition-colors'
              }, 'Wellness')
            )
          )
        ),

        // Contact Info
        React.createElement('div', {},
          React.createElement('h4', {
            className: 'text-lg font-semibold mb-4'
          }, 'Contact'),
          React.createElement('div', {
            className: 'space-y-2 text-gray-400'
          },
            React.createElement('p', {},
              React.createElement('i', { className: 'fas fa-map-marker-alt mr-2' }),
              '123 Heritage Street, New Delhi'
            ),
            React.createElement('p', {},
              React.createElement('i', { className: 'fas fa-phone mr-2' }),
              '+91 98765 43210'
            ),
            React.createElement('p', {},
              React.createElement('i', { className: 'fas fa-envelope mr-2' }),
              'hello@tatvaani.com'
            )
          )
        )
      )
    ),

    React.createElement('div', {
      className: 'border-t border-gray-700 py-6'
    },
      React.createElement('div', {
        className: 'container mx-auto px-4 text-center text-gray-400'
      },
        React.createElement('p', {},
          '© 2024 Tatvaani. All rights reserved. | Made with ',
          React.createElement('i', { className: 'fas fa-heart text-red-500' }),
          ' for India\'s heritage'
        )
      )
    )
  );
};

// Main App Component
const App = () => {
  const { currentPage } = useAuth();

  const renderPage = () => {
    if (currentPage === 'home') {
      return React.createElement(HomePage);
    } else if (currentPage === 'products' || currentPage.startsWith('products?')) {
      return React.createElement(ProductsPage);
    } else if (currentPage.startsWith('product/')) {
      const productId = currentPage.split('/')[1];
      return React.createElement(ProductDetail, { productId });
    } else if (currentPage === 'about') {
      return React.createElement(AboutPage);
    } else if (currentPage === 'contact') {
      return React.createElement(ContactPage);
    } else if (currentPage === 'login') {
      return React.createElement(AuthPage);
    } else if (currentPage === 'cart') {
      return React.createElement(CartPage);
    } else {
      return React.createElement(HomePage);
    }
  };

  return React.createElement('div', {
    className: 'min-h-screen bg-tatvaani-light'
  },
    React.createElement(Header),
    React.createElement('main', {}, renderPage()),
    React.createElement(Footer)
  );
};

// Initialize the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  React.createElement(AuthProvider, {},
    React.createElement(App)
  )
);
