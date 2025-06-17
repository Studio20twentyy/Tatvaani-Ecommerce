
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'tatvaani_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Data storage files
const USERS_FILE = './data/users.json';
const PRODUCTS_FILE = './data/products.json';
const ORDERS_FILE = './data/orders.json';
const INQUIRIES_FILE = './data/inquiries.json';

// Initialize data directories and files
const initializeData = () => {
  if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
  }
  
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const initialProducts = [
      {
        id: uuidv4(),
        name: "Handwoven Kashmiri Pashmina Shawl",
        category: "Handicrafts",
        price: 8500,
        originalPrice: 12000,
        description: "Authentic Kashmiri pashmina shawl handwoven by master artisans. Made from the finest cashmere wool.",
        image: "/images/pashmina-shawl.jpg",
        images: ["/images/pashmina-1.jpg", "/images/pashmina-2.jpg"],
        artisan: "Mohammad Ali Khan",
        origin: "Kashmir, India",
        inStock: true,
        featured: true,
        rating: 4.8,
        reviews: 23
      },
      {
        id: uuidv4(),
        name: "Organic Himalayan Pink Salt",
        category: "Spices & Food",
        price: 350,
        originalPrice: 450,
        description: "Pure, unrefined pink salt from the pristine Himalayan mountains. Rich in minerals and natural flavor.",
        image: "/images/himalayan-salt.jpg",
        images: ["/images/salt-1.jpg", "/images/salt-2.jpg"],
        artisan: "Himalayan Harvest Co-op",
        origin: "Himachal Pradesh, India",
        inStock: true,
        featured: true,
        rating: 4.9,
        reviews: 156
      },
      {
        id: uuidv4(),
        name: "Ayurvedic Turmeric Wellness Tea",
        category: "Wellness",
        price: 650,
        originalPrice: 850,
        description: "Traditional Ayurvedic blend with organic turmeric, ginger, and healing herbs. Promotes immunity and wellness.",
        image: "/images/turmeric-tea.jpg",
        images: ["/images/tea-1.jpg", "/images/tea-2.jpg"],
        artisan: "Kerala Ayurveda Collective",
        origin: "Kerala, India",
        inStock: true,
        featured: true,
        rating: 4.7,
        reviews: 89
      },
      {
        id: uuidv4(),
        name: "Brass Temple Bell Set",
        category: "Handicrafts",
        price: 1200,
        originalPrice: 1600,
        description: "Handcrafted brass temple bells with intricate carvings. Perfect for meditation and spiritual practices.",
        image: "/images/temple-bells.jpg",
        images: ["/images/bells-1.jpg", "/images/bells-2.jpg"],
        artisan: "Rajesh Kumar",
        origin: "Rajasthan, India",
        inStock: true,
        featured: false,
        rating: 4.6,
        reviews: 34
      },
      {
        id: uuidv4(),
        name: "Organic Cardamom Pods",
        category: "Spices & Food",
        price: 800,
        originalPrice: 1000,
        description: "Premium green cardamom pods from the Western Ghats. Aromatic and flavorful spice for cooking and tea.",
        image: "/images/cardamom.jpg",
        images: ["/images/cardamom-1.jpg", "/images/cardamom-2.jpg"],
        artisan: "Spice Gardens Collective",
        origin: "Karnataka, India",
        inStock: true,
        featured: false,
        rating: 4.8,
        reviews: 67
      },
      {
        id: uuidv4(),
        name: "Neem & Tulsi Face Care Set",
        category: "Wellness",
        price: 950,
        originalPrice: 1250,
        description: "Natural skincare set with neem and tulsi extracts. Cleanses and nourishes skin naturally.",
        image: "/images/face-care.jpg",
        images: ["/images/skincare-1.jpg", "/images/skincare-2.jpg"],
        artisan: "Herbal Beauty Co-op",
        origin: "Tamil Nadu, India",
        inStock: true,
        featured: false,
        rating: 4.5,
        reviews: 112
      }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2));
  }
  
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
  }
  
  if (!fs.existsSync(INQUIRIES_FILE)) {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([]));
  }
};

// Helper functions
const readData = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeData = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const users = readData(USERS_FILE);
    
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      isAdmin: email === 'admin@tatvaani.com',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    writeData(USERS_FILE, users);
    
    const token = jwt.sign({ id: newUser.id, email: newUser.email, isAdmin: newUser.isAdmin }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readData(USERS_FILE);
    const user = users.find(u => u.email === email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Product routes
app.get('/api/products', (req, res) => {
  const products = readData(PRODUCTS_FILE);
  const { category, search, minPrice, maxPrice, origin } = req.query;
  
  let filteredProducts = products;
  
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  
  if (search) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseInt(minPrice));
  }
  
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseInt(maxPrice));
  }
  
  if (origin) {
    filteredProducts = filteredProducts.filter(p => p.origin.toLowerCase().includes(origin.toLowerCase()));
  }
  
  res.json(filteredProducts);
});

app.get('/api/products/featured', (req, res) => {
  const products = readData(PRODUCTS_FILE);
  const featuredProducts = products.filter(p => p.featured);
  res.json(featuredProducts);
});

app.get('/api/products/:id', (req, res) => {
  const products = readData(PRODUCTS_FILE);
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// Admin product routes
app.post('/api/admin/products', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const products = readData(PRODUCTS_FILE);
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  writeData(PRODUCTS_FILE, products);
  res.json(newProduct);
});

app.put('/api/admin/products/:id', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const products = readData(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  products[index] = { ...products[index], ...req.body, updatedAt: new Date().toISOString() };
  writeData(PRODUCTS_FILE, products);
  res.json(products[index]);
});

app.delete('/api/admin/products/:id', authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const products = readData(PRODUCTS_FILE);
  const filteredProducts = products.filter(p => p.id !== req.params.id);
  writeData(PRODUCTS_FILE, filteredProducts);
  res.json({ message: 'Product deleted' });
});

// Order routes
app.post('/api/orders', authenticateToken, (req, res) => {
  const orders = readData(ORDERS_FILE);
  const newOrder = {
    id: uuidv4(),
    userId: req.user.id,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  writeData(ORDERS_FILE, orders);
  res.json(newOrder);
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const orders = readData(ORDERS_FILE);
  if (req.user.isAdmin) {
    res.json(orders);
  } else {
    const userOrders = orders.filter(o => o.userId === req.user.id);
    res.json(userOrders);
  }
});

// Contact route
app.post('/api/contact', (req, res) => {
  const inquiries = readData(INQUIRIES_FILE);
  const newInquiry = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  inquiries.push(newInquiry);
  writeData(INQUIRIES_FILE, inquiries);
  res.json({ message: 'Inquiry submitted successfully' });
});

// Newsletter signup
app.post('/api/newsletter', (req, res) => {
  // In a real app, you'd integrate with an email service
  res.json({ message: 'Subscribed to newsletter successfully' });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize data and start server
initializeData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Tatvaani server running on port ${PORT}`);
});
