import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS
} from './src/data/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store_data.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial fallback seeds
const DEFAULT_CATEGORIES = [
  'ບຳລຸງຜິວ',
  'ເຄື່ອງສຳອາງ',
  'ເສື້ອຜ້າແຟຊັ່ນ',
  'ກະເປົາ & ອຸປະກອນ'
];

interface StoreData {
  products: any[];
  categories: string[];
  orders: any[];
  settings: any;
}

function loadStoreData(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const prods = Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : INITIAL_PRODUCTS;
      const cats = Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES;
      const ords = Array.isArray(parsed.orders) && parsed.orders.length > 0 ? parsed.orders : INITIAL_ORDERS;
      const sets = parsed.settings || INITIAL_SETTINGS;

      return {
        products: prods,
        categories: cats,
        orders: ords,
        settings: sets
      };
    }
  } catch (err) {
    console.error('Error reading store data:', err);
  }

  const initialData: StoreData = {
    products: INITIAL_PRODUCTS,
    categories: DEFAULT_CATEGORIES,
    orders: INITIAL_ORDERS,
    settings: INITIAL_SETTINGS
  };
  saveStoreData(initialData);
  return initialData;
}

function saveStoreData(data: StoreData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store data:', err);
  }
}

// In-memory cache loaded from disk
let store = loadStoreData();

// Enable JSON body parser with generous limit for multi-image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// CORS headers for development flexibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ----------------------------------------------------
// REST API ENDPOINTS FOR REAL-TIME STORE PERSISTENCE
// ----------------------------------------------------

// 1. Products API
app.get('/api/products', (req, res) => {
  res.json({ success: true, products: store.products });
});

app.post('/api/products', (req, res) => {
  const newProduct = req.body;
  if (!newProduct || !newProduct.name) {
    return res.status(400).json({ success: false, message: 'Invalid product data' });
  }

  // Ensure ID
  if (!newProduct.id) {
    newProduct.id = `prod-${Date.now().toString(36)}`;
  }

  // Prepend so newly added product is immediately at top of sales list
  store.products = [newProduct, ...store.products.filter((p: any) => p.id !== newProduct.id)];

  // Automatically register category if new
  if (newProduct.category && !store.categories.includes(newProduct.category.trim())) {
    store.categories.push(newProduct.category.trim());
  }

  saveStoreData(store);
  console.log(`[STORE] Product added and published to sales page: ${newProduct.name} (ID: ${newProduct.id})`);
  res.json({ success: true, product: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;

  const index = store.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    store.products[index] = { ...store.products[index], ...updatedProduct };
  } else {
    store.products.unshift(updatedProduct);
  }

  if (updatedProduct.category && !store.categories.includes(updatedProduct.category.trim())) {
    store.categories.push(updatedProduct.category.trim());
  }

  saveStoreData(store);
  res.json({ success: true, product: updatedProduct });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  store.products = store.products.filter((p: any) => p.id !== id);
  saveStoreData(store);
  res.json({ success: true });
});

// 2. Categories API
app.get('/api/categories', (req, res) => {
  res.json({ success: true, categories: store.categories });
});

app.post('/api/categories', (req, res) => {
  const { category } = req.body;
  const trimmed = category ? category.trim() : '';
  if (trimmed && !store.categories.includes(trimmed)) {
    store.categories.push(trimmed);
    saveStoreData(store);
  }
  res.json({ success: true, categories: store.categories });
});

app.delete('/api/categories/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  store.categories = store.categories.filter((c: string) => c !== name);
  saveStoreData(store);
  res.json({ success: true, categories: store.categories });
});

// 3. Orders API
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: store.orders });
});

app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.id) {
    return res.status(400).json({ success: false, message: 'Invalid order' });
  }

  store.orders = [newOrder, ...store.orders];

  // Deduct stock for ordered items
  if (Array.isArray(newOrder.items)) {
    newOrder.items.forEach((item: any) => {
      const prod = store.products.find((p: any) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        prod.salesCount = (prod.salesCount || 0) + item.quantity;
      }
    });
  }

  saveStoreData(store);
  res.json({ success: true, order: newOrder });
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = store.orders.findIndex((o: any) => o.id === id);
  if (idx !== -1) {
    store.orders[idx] = { ...store.orders[idx], ...updates };
    saveStoreData(store);
    return res.json({ success: true, order: store.orders[idx] });
  }
  res.status(404).json({ success: false, message: 'Order not found' });
});

// 4. Settings API
app.get('/api/settings', (req, res) => {
  res.json({ success: true, settings: store.settings });
});

app.put('/api/settings', (req, res) => {
  store.settings = { ...store.settings, ...req.body };
  saveStoreData(store);
  res.json({ success: true, settings: store.settings });
});

// Bulk sync endpoint (useful for initial synchronization between localStorage & server)
app.post('/api/sync', (req, res) => {
  const { products, categories, orders, settings } = req.body;
  if (Array.isArray(products) && products.length > 0) {
    // Merge server products with client products (client wins if newer or server empty)
    if (store.products.length === 0) {
      store.products = products;
    } else {
      // Merge unique by ID
      const existingIds = new Set(store.products.map((p: any) => p.id));
      const toAdd = products.filter((p: any) => !existingIds.has(p.id));
      store.products = [...toAdd, ...store.products];
    }
  }

  if (Array.isArray(categories) && categories.length > 0) {
    store.categories = Array.from(new Set([...store.categories, ...categories]));
  }

  if (settings && !store.settings) {
    store.settings = settings;
  }

  saveStoreData(store);
  res.json({
    success: true,
    products: store.products,
    categories: store.categories,
    orders: store.orders,
    settings: store.settings
  });
});

// ----------------------------------------------------
// FRONTEND SERVING (Vite in Dev / Static in Production)
// ----------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Ny Store Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
