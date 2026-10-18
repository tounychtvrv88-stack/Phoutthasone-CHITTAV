import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store_data.json');
const INITIAL_SEED_FILE = path.join(DATA_DIR, 'initial_seed.json');

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

const SAMPLE_PRODUCT_IDS = new Set([
  'prod-001',
  'prod-002',
  'prod-003',
  'prod-004',
  'prod-005',
  'prod-006',
  'prod-007',
  'prod-008'
]);
const SAMPLE_ORDER_IDS = new Set(['NY-2026-9041', 'NY-2026-9042', 'NY-2026-9043']);

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
      if (Array.isArray(parsed.products)) {
        const cleanProducts = parsed.products.filter((p: any) => !SAMPLE_PRODUCT_IDS.has(p.id));
        const cleanOrders = (Array.isArray(parsed.orders) ? parsed.orders : []).filter(
          (o: any) => !SAMPLE_ORDER_IDS.has(o.id)
        );
        return {
          products: cleanProducts,
          categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
          orders: cleanOrders,
          settings: parsed.settings || null
        };
      }
    }
  } catch (err) {
    console.error('Error reading store data:', err);
  }

  try {
    if (fs.existsSync(INITIAL_SEED_FILE)) {
      const raw = fs.readFileSync(INITIAL_SEED_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const cleanProducts = (Array.isArray(parsed.products) ? parsed.products : []).filter(
        (p: any) => !SAMPLE_PRODUCT_IDS.has(p.id)
      );
      const cleanOrders = (Array.isArray(parsed.orders) ? parsed.orders : []).filter(
        (o: any) => !SAMPLE_ORDER_IDS.has(o.id)
      );
      const data: StoreData = {
        products: cleanProducts,
        categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
        orders: cleanOrders,
        settings: parsed.settings || null
      };
      saveStoreData(data);
      return data;
    }
  } catch (err) {
    console.error('Error reading initial seed data:', err);
  }

  return {
    products: [],
    categories: DEFAULT_CATEGORIES,
    orders: [],
    settings: null
  };
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

// ----------------------------------------------------
// WHATSAPP API NOTIFICATION SERVICE
// ----------------------------------------------------
interface WhatsAppNotificationLog {
  id: string;
  orderId?: string;
  recipient: string;
  status: 'sent' | 'failed' | 'link_generated';
  method: string;
  timestamp: string;
  details?: string;
}

const whatsappLogs: WhatsAppNotificationLog[] = [];

function cleanWhatsAppPhone(phone: string): string {
  if (!phone) return '8562028039599';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('020')) {
    cleaned = '85620' + cleaned.slice(3);
  } else if (cleaned.startsWith('20') && cleaned.length === 10) {
    cleaned = '856' + cleaned;
  } else if (!cleaned.startsWith('856') && cleaned.length > 0) {
    cleaned = '85620' + cleaned;
  }
  return cleaned || '8562028039599';
}

function buildWhatsAppOrderMessage(order: any, storeName = 'NY Beauty Shop'): string {
  const itemsText = Array.isArray(order.items)
    ? order.items
        .map((it: any) => {
          const name = it.product?.name || it.name || 'ສິນຄ້າ';
          const opts = it.selectedOptions ? Object.values(it.selectedOptions).join(', ') : '';
          const qty = it.quantity || 1;
          return `• ${name}${opts ? ` (${opts})` : ''} x${qty} = ₭${(Number(it.price || 0) * qty).toLocaleString()}`;
        })
        .join('\n')
    : 'ບໍ່ມີລາຍການສິນຄ້າ';

  return `🌸 *ແຈ້ງເຕືອນອໍເດີ້ໃໝ່! (${storeName})*
📦 *ລະຫັດອໍເດີ້:* #${order.id}
👤 *ລູກຄ້າ:* ${order.customerName}
📞 *ເບີໂທ:* ${order.customerPhone}
📍 *ທີ່ຢູ່ຈັດສົ່ງ:* ${order.address}
🚚 *ຂົນສົ່ງ:* ${order.shippingProvider || 'Anusith'} Express
💰 *ຍອດຊຳລະທັງໝົດ:* ₭${Number(order.total || 0).toLocaleString()}
💳 *ວິທີຊຳລະ:* BCEL One (ຊຳລະແລ້ວ ✅)
🛒 *ລາຍການສິນຄ້າ:*
${itemsText}
⏰ *ວັນທີ:* ${order.createdAt || new Date().toLocaleString('lo-LA')}`;
}

async function sendWhatsAppNotification(order: any, settings: any) {
  const apiConfig = settings?.whatsappApi || {};
  const notifyNumber = cleanWhatsAppPhone(apiConfig.notifyNumber || settings?.whatsappNumber || process.env.WHATSAPP_NOTIFY_NUMBER || '8562028039599');
  const storeName = settings?.storeName || 'NY Beauty Shop';
  const messageText = buildWhatsAppOrderMessage(order, storeName);
  const waLink = `https://wa.me/${notifyNumber}?text=${encodeURIComponent(messageText)}`;

  const logEntry: WhatsAppNotificationLog = {
    id: `walog-${Date.now()}`,
    orderId: order.id,
    recipient: notifyNumber,
    status: 'link_generated',
    method: 'wa_link',
    timestamp: new Date().toISOString()
  };

  const phoneNumberId = apiConfig.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = apiConfig.accessToken || process.env.WHATSAPP_API_TOKEN;

  if (apiConfig.enabled !== false && phoneNumberId && accessToken) {
    try {
      const metaUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
      const res = await fetch(metaUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: notifyNumber,
          type: 'text',
          text: {
            preview_url: false,
            body: messageText
          }
        })
      });

      const data = await res.json();
      if (res.ok) {
        logEntry.status = 'sent';
        logEntry.method = 'meta_cloud_api';
        logEntry.details = `Success: Message ID ${data?.messages?.[0]?.id || 'OK'}`;
        console.log(`[WHATSAPP API] Successfully sent order #${order.id} alert via Meta Cloud API to ${notifyNumber}`);
      } else {
        logEntry.status = 'failed';
        logEntry.method = 'meta_cloud_api';
        logEntry.details = `Meta API Error: ${data?.error?.message || JSON.stringify(data)}`;
        console.warn(`[WHATSAPP API] Meta Cloud API error:`, data);
      }
    } catch (err: any) {
      logEntry.status = 'failed';
      logEntry.details = `Network error: ${err.message}`;
      console.error('[WHATSAPP API] Error sending notification:', err);
    }
  } else if (apiConfig.enabled !== false && apiConfig.webhookUrl) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiConfig.webhookToken) {
        headers['Authorization'] = `Bearer ${apiConfig.webhookToken}`;
      }
      const res = await fetch(apiConfig.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: 'new_order',
          recipient: notifyNumber,
          message: messageText,
          orderId: order.id,
          order
        })
      });
      if (res.ok) {
        logEntry.status = 'sent';
        logEntry.method = 'webhook_gateway';
        logEntry.details = `Sent to webhook successfully (${res.status})`;
        console.log(`[WHATSAPP API] Sent order #${order.id} alert via Webhook to ${apiConfig.webhookUrl}`);
      } else {
        logEntry.status = 'failed';
        logEntry.method = 'webhook_gateway';
        logEntry.details = `Webhook returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      logEntry.status = 'failed';
      logEntry.details = `Webhook error: ${err.message}`;
    }
  } else {
    logEntry.details = `Direct WhatsApp alert ready (${notifyNumber})`;
    console.log(`[WHATSAPP API] Direct alert prepared for order #${order.id} -> ${notifyNumber}`);
  }

  whatsappLogs.unshift(logEntry);
  if (whatsappLogs.length > 50) whatsappLogs.pop();

  return {
    success: logEntry.status === 'sent' || logEntry.status === 'link_generated',
    status: logEntry.status,
    method: logEntry.method,
    details: logEntry.details,
    waLink,
    recipient: notifyNumber,
    messageText
  };
}

// 3. Orders API
app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: store.orders });
});

app.post('/api/orders', async (req, res) => {
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

  // Automatically trigger WhatsApp notification via API
  let waAlert = null;
  try {
    waAlert = await sendWhatsAppNotification(newOrder, store.settings);
  } catch (waErr: any) {
    console.error('[WHATSAPP API] Error sending notification:', waErr);
  }

  res.json({ success: true, order: newOrder, whatsappAlert: waAlert });
});

app.post('/api/orders/:id/notify-whatsapp', async (req, res) => {
  const { id } = req.params;
  const order = store.orders.find((o: any) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  const result = await sendWhatsAppNotification(order, store.settings);
  res.json({ success: true, orderId: id, whatsappAlert: result });
});

// WhatsApp API testing & logs endpoints
app.post('/api/whatsapp/test', async (req, res) => {
  const testConfig = req.body || {};
  const settings = {
    ...store.settings,
    whatsappApi: {
      ...store.settings?.whatsappApi,
      ...testConfig
    }
  };

  const mockOrder = {
    id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: 'ທົດສອບ ລະບົບແຈ້ງເຕືອນ (Test Customer)',
    customerPhone: '020 2803 9599',
    address: 'ນະຄອນຫຼວງວຽງຈັນ (Vientiane, Laos)',
    shippingProvider: 'Anusith',
    total: 185000,
    createdAt: new Date().toLocaleString('lo-LA'),
    items: [
      {
        name: 'ເຊຣັ່ມບຳລຸງຜິວ (Test Product)',
        quantity: 1,
        price: 185000,
        selectedOptions: { 'ຂະໜາດ': 'ມາດຕະຖານ' }
      }
    ]
  };

  const result = await sendWhatsAppNotification(mockOrder, settings);
  res.json({ success: true, testResult: result });
});

app.get('/api/whatsapp/logs', (req, res) => {
  res.json({ success: true, logs: whatsappLogs });
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
  if (Array.isArray(products)) {
    const cleanProducts = products.filter((p: any) => !SAMPLE_PRODUCT_IDS.has(p.id));
    store.products = cleanProducts;
  }

  if (Array.isArray(orders)) {
    const cleanOrders = orders.filter((o: any) => !SAMPLE_ORDER_IDS.has(o.id));
    store.orders = cleanOrders;
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
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));
  const isProd = process.env.NODE_ENV === 'production' || hasDist;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
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
