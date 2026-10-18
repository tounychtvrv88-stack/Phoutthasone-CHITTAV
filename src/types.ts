export type OrderStatus =
  | 'pending_payment' // ລໍຖ້າຊຳລະເງິນ
  | 'paid'            // ຊຳລະແລ້ວ
  | 'packing'         // ກຳລັງແພັກ
  | 'shipped'         // ຈັດສົ່ງແລ້ວ
  | 'completed'       // ສຳເລັດ
  | 'cancelled';      // ຍົກເລີກ

export type ShippingProvider = 'Anusith' | 'Hal' | 'Mixay';

export interface ProductOption {
  name: string;      // e.g. "ຂະໜາດ" (Size) or "ປະລິມານ" (Volume) or "ສີ" (Color)
  values: string[];  // e.g. ["30ml", "50ml", "100ml"]
  prices?: Record<string, number>;         // Specific sale price in LAK (ລາຄາຂາຍ): e.g. { "30ml": 120000, "50ml": 185000, "100ml": 320000 }
  costPrices?: Record<string, number>;     // Specific cost price in LAK (ລາຄາຕົ້ນທຶນ): e.g. { "30ml": 75000, "50ml": 115000, "100ml": 200000 }
  originalPrices?: Record<string, number>; // Specific original/promo price in LAK (ລາຄາຫຼຸດພິເສດ/ລາຄາເດີມ): e.g. { "50ml": 220000 }
  stocks?: Record<string, number>;         // Specific stock quantity per option (ຈຳນວນສະຕັອກ): e.g. { "30ml": 20, "50ml": 15, "100ml": 5 }
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;              // In LAK (ກີບ) ລາຄາຂາຍ
  costPrice?: number;         // In LAK (ກີບ) ລາຄາຕົ້ນທຶນ
  originalPrice?: number;      // Original price if promotional
  description: string;
  images: string[];
  options?: ProductOption[];
  stock: number;
  lowStockThreshold: number;   // Alert when stock <= this (default 5)
  salesCount: number;
  isPromo?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  selectedOptions: Record<string, string>; // e.g. { "ຂະໜາດ": "50ml", "ສີ": "ຊົມພູອ່ອນ" }
  quantity: number;
  price: number;
  costPrice?: number; // Snapshot of cost price at order time
}

export interface Order {
  id: string; // e.g. "NY-8491"
  customerName: string;
  customerPhone: string;
  address: string;
  province?: string;
  district?: string;
  shippingProvider: ShippingProvider;
  trackingNumber?: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentSlipUrl?: string;
  paymentMethod: 'BCEL_ONE';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface WhatsAppApiConfig {
  enabled: boolean;
  provider: 'meta_cloud_api' | 'webhook_gateway' | 'wa_direct';
  phoneNumberId?: string; // Meta Cloud API Phone Number ID
  accessToken?: string;   // Meta Cloud API System User Access Token
  notifyNumber?: string;  // Destination WhatsApp number for order alerts (e.g. 8562028039599)
  webhookUrl?: string;    // Custom WhatsApp Gateway / Webhook URL
  webhookToken?: string;  // Authorization Token for Gateway Webhook
}

export interface StoreSettings {
  storeName: string;
  storePhone: string;
  whatsappNumber: string;
  facebookPageName?: string;
  facebookUrl?: string;
  bcelAccountName: string;
  bcelAccountNumber: string;
  bcelQrImage: string;
  shippingRates: Record<ShippingProvider, number>;
  whatsappApi?: WhatsAppApiConfig;
}

// Role-Based Access Control (RBAC)
export type StaffRole =
  | 'super_admin'       // ຜູ້ດູແລລະບົບສູງສຸດ
  | 'order_manager'     // ຜູ້ຈັດການຄຳສັ່ງຊື້
  | 'inventory_manager' // ຜູ້ຈັດການຄັງສິນຄ້າ
  | 'support_admin';    // ພະນັກງານບໍລິການລູກຄ້າ

export type PermissionKey =
  | 'orders_view'       // ເບິ່ງລາຍການຄຳສັ່ງຊື້
  | 'orders_update'     // ອັບເດດສະຖານະ & ເລກ Tracking
  | 'inventory_view'    // ເບິ່ງລາຍການສິນຄ້າ & ສະຕັອກ
  | 'inventory_edit'    // ເພີ່ມ/ແກ້ໄຂສິນຄ້າ & ເຕີມສະຕັອກ
  | 'finance_view'      // ເບິ່ງຍອດເງິນ & ລາຍຮັບ
  | 'finance_manage'    // ຕັ້ງຄ່າບັນຊີ BCEL One & ຄ່າຂົນສົ່ງ
  | 'staff_manage'      // ຈັດການສິດ & ບັນຊີພະນັກງານ
  | 'system_monitor';   // ກວດສອບສະຖານະລະບົບ & Logs

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  roleTitle: string;
  phone: string;
  email: string;
  password?: string;
  status: 'active' | 'suspended';
  permissions: Record<PermissionKey, boolean>;
  createdAt: string;
  lastActive: string;
  avatarColor: string;
}

// System Health & Monitoring
export interface SystemServiceHealth {
  id: string;
  name: string;
  nameLao: string;
  status: 'healthy' | 'warning' | 'down';
  latencyMs: number;
  lastChecked: string;
  description: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  operator: string;
  role: string;
  module: 'OMS' | 'INVENTORY' | 'FINANCE' | 'PERMISSIONS' | 'SYSTEM';
  action: string;
  details: string;
  status: 'success' | 'warning' | 'info';
}

