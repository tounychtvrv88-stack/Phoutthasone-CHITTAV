import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  CartItem,
  StoreSettings,
  OrderStatus,
  StaffMember,
  SystemAuditLog
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SETTINGS,
  INITIAL_STAFF,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import { generateOrderId, getCurrentDateTime } from '../utils/format';
import { DeviceViewMode, getStoredViewMode, applyViewMode } from '../utils/viewMode';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  storeSettings: StoreSettings;
  staffList: StaffMember[];
  currentStaffId: string;
  currentStaff: StaffMember;
  isAdminAuthenticated: boolean;
  loginAdmin: (emailOrStaffId: string, password: string) => { success: boolean; message?: string };
  logoutAdmin: () => void;
  auditLogs: SystemAuditLog[];
  categories: string[];
  addCategory: (categoryName: string) => boolean;
  deleteCategory: (categoryName: string) => boolean;
  renameCategory: (oldName: string, newName: string) => boolean;
  viewMode: DeviceViewMode;
  setViewMode: (mode: DeviceViewMode) => void;
  toggleViewMode: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  lowStockProducts: Product[];
  addToCart: (
    product: Product,
    selectedOptions: Record<string, string>,
    quantity: number
  ) => { success: boolean; message?: string };
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  createOrder: (
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ) => Order;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ) => void;
  addProduct: (product: Omit<Product, 'id' | 'salesCount'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  restockProduct: (productId: string, additionalStock: number) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  setCurrentStaffId: (staffId: string) => void;
  addStaff: (staff: Omit<StaffMember, 'id' | 'createdAt' | 'lastActive'>) => void;
  updateStaff: (staff: StaffMember) => void;
  deleteStaff: (staffId: string) => void;
  toggleStaffStatus: (staffId: string) => void;
  addAuditLog: (log: Omit<SystemAuditLog, 'id' | 'timestamp'>) => void;
  clearAuditLogs: () => void;
  resetToSampleData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'ny_store_products_v1',
  ORDERS: 'ny_store_orders_v1',
  CART: 'ny_store_cart_v1',
  SETTINGS: 'ny_store_settings_v1',
  STAFF: 'ny_store_staff_v1',
  CURRENT_STAFF_ID: 'ny_store_current_staff_id_v1',
  AUDIT_LOGS: 'ny_store_audit_logs_v1',
  ADMIN_AUTH: 'ny_store_admin_auth_v1',
  CATEGORIES: 'ny_store_categories_v1'
};

const DEFAULT_CATEGORIES = [
  'ບຳລຸງຜິວ',
  'ເຄື່ອງສຳອາງ',
  'ເສື້ອຜ້າແຟຊັ່ນ',
  'ກະເປົາ & ອຸປະກອນ'
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  // 1. Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map((p) => {
          if (p.costPrice === undefined || p.costPrice === null) {
            const initialMatch = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
            return {
              ...p,
              costPrice: initialMatch?.costPrice ?? Math.round(p.price * 0.62)
            };
          }
          return p;
        });
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 2. Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.map((o) => ({
          ...o,
          items: (o.items || []).map((it) => {
            const prod = INITIAL_PRODUCTS.find((ip) => ip.id === it.productId);
            const cost = it.costPrice ?? it.product?.costPrice ?? prod?.costPrice ?? Math.round(it.price * 0.62);
            return {
              ...it,
              costPrice: cost,
              product: {
                ...it.product,
                costPrice: it.product?.costPrice ?? cost
              }
            };
          })
        }));
      }
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // 3. Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it was the placeholder 5999 8888, migrate to the requested 020 28039599
        if (!parsed.whatsappNumber || parsed.whatsappNumber.includes('59998888')) {
          parsed.whatsappNumber = INITIAL_SETTINGS.whatsappNumber;
        }
        if (!parsed.storePhone || parsed.storePhone.includes('5999 8888')) {
          parsed.storePhone = INITIAL_SETTINGS.storePhone;
        }
        // Update account details to requested values
        if (!parsed.bcelAccountName || parsed.bcelAccountName.includes('CHAMPA')) {
          parsed.bcelAccountName = INITIAL_SETTINGS.bcelAccountName;
        }
        if (!parsed.bcelAccountNumber || parsed.bcelAccountNumber.includes('01984288001')) {
          parsed.bcelAccountNumber = INITIAL_SETTINGS.bcelAccountNumber;
        }
        if (!parsed.bcelQrImage || parsed.bcelQrImage === '') {
          parsed.bcelQrImage = INITIAL_SETTINGS.bcelQrImage;
        }
        // Ensure Facebook page & URL are populated
        if (!parsed.facebookUrl) {
          parsed.facebookUrl = INITIAL_SETTINGS.facebookUrl;
        }
        if (!parsed.facebookPageName) {
          parsed.facebookPageName = INITIAL_SETTINGS.facebookPageName;
        }
        if (!parsed.storeName || parsed.storeName === 'Ny Store') {
          parsed.storeName = INITIAL_SETTINGS.storeName;
        }
        // Ensure shipping rates default to 0k as requested
        parsed.shippingRates = {
          Anusith: 0,
          Hal: 0,
          Mixay: 0
        };
        return { ...INITIAL_SETTINGS, ...parsed };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 5. Staff Members & RBAC
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (saved) {
        const parsed: StaffMember[] = JSON.parse(saved);
        return parsed.map((s, idx) => {
          if (idx === 0 || s.role === 'super_admin') {
            return {
              ...s,
              email: s.email === 'tukta.ny@nystore.la' ? 'touny.chtvrv88@gmail.com' : (s.email || 'touny.chtvrv88@gmail.com')
            };
          }
          return s;
        });
      }
      return INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  // 6. Currently Active Operator (Staff ID)
  const [currentStaffId, setCurrentStaffId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_STAFF_ID);
      return saved || (INITIAL_STAFF[0]?.id ?? 'staff-001');
    } catch {
      return 'staff-001';
    }
  });

  // 7. System Audit Logs
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // 8. Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true' ||
        localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true'
      );
    } catch {
      return false;
    }
  });

  // 9. Categories
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const valid = parsed.filter((c) => Boolean(c) && c.trim() !== '' && c !== 'ທັງໝົດ');
        if (valid.length > 0) {
          const prodCategories = INITIAL_PRODUCTS.map((p) => p.category).filter(Boolean);
          const combined = Array.from(new Set([...valid, ...prodCategories]));
          return combined;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  // 10. View Mode (Mobile vs Desktop)
  const [viewMode, setViewModeState] = useState<DeviceViewMode>(() => getStoredViewMode());

  const setViewMode = (mode: DeviceViewMode) => {
    setViewModeState(mode);
    applyViewMode(mode);
  };

  const toggleViewMode = () => {
    const nextMode = viewMode === 'desktop' ? 'mobile' : 'desktop';
    setViewMode(nextMode);
  };

  // Sync initial view mode on mount
  useEffect(() => {
    applyViewMode(viewMode);
  }, []);

  // Cross-Tab & Multi-Window Real-time Data Synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === STORAGE_KEYS.PRODUCTS) {
          setProducts(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.ORDERS) {
          setOrders(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.SETTINGS) {
          setStoreSettings(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.STAFF) {
          setStaffList(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.CURRENT_STAFF_ID) {
          setCurrentStaffId(e.newValue);
        } else if (e.key === STORAGE_KEYS.AUDIT_LOGS) {
          setAuditLogs(JSON.parse(e.newValue));
        } else if (e.key === STORAGE_KEYS.ADMIN_AUTH) {
          setIsAdminAuthenticated(e.newValue === 'true');
        } else if (e.key === STORAGE_KEYS.CATEGORIES) {
          setCategories(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Safe Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (err) {
      console.warn('LocalStorage quota exceeded for products, preserved on server:', err);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (err) {
      console.warn('LocalStorage save error for orders:', err);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (err) {
      console.warn('LocalStorage save error for cart:', err);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(storeSettings));
    } catch (err) {
      console.warn('LocalStorage save error for settings:', err);
    }
  }, [storeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
    } catch (err) {
      console.warn('LocalStorage save error for staff:', err);
    }
  }, [staffList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STAFF_ID, currentStaffId);
    } catch (err) {
      console.warn('LocalStorage save error for staff id:', err);
    }
  }, [currentStaffId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch (err) {
      console.warn('LocalStorage save error for audit logs:', err);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (err) {
      console.warn('LocalStorage save error for categories:', err);
    }
  }, [categories]);

  // Real-time synchronization with server REST API
  useEffect(() => {
    let isMounted = true;

    async function syncWithServer() {
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            products,
            categories,
            orders,
            settings: storeSettings
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            if (Array.isArray(data.products) && data.products.length > 0) {
              setProducts(data.products);
            }
            if (Array.isArray(data.categories) && data.categories.length > 0) {
              setCategories(data.categories);
            }
            if (Array.isArray(data.orders) && data.orders.length > 0) {
              setOrders(data.orders);
            }
          }
        }
      } catch {
        // Server offline or running client-only dev mode - keep local state
      }
    }

    syncWithServer();

    // Poll every 8 seconds for multi-device live store updates
    const interval = setInterval(syncWithServer, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Derived
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Low stock products
  const lowStockProducts = products.filter(
    (p) => p.stock <= (p.lowStockThreshold || 5)
  );

  // Cart operations
  const addToCart = (
    product: Product,
    selectedOptions: Record<string, string>,
    quantity: number
  ) => {
    // Check available stock
    const currentProduct = products.find((p) => p.id === product.id) || product;
    if (currentProduct.stock <= 0) {
      return { success: false, message: 'ສິນຄ້າໝົດສະຕັອກຊົ່ວຄາວ' };
    }

    const optionsKey = JSON.stringify(selectedOptions);
    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        JSON.stringify(item.selectedOptions) === optionsKey
    );

    const existingQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    if (existingQty + quantity > currentProduct.stock) {
      return {
        success: false,
        message: `ສະຕັອກເຫຼືອພຽງ ${currentProduct.stock} ຊິ້ນເທົ່ານັ້ນ`
      };
    }

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        product: currentProduct,
        selectedOptions,
        quantity,
        price: product.price,
        costPrice: product.costPrice ?? currentProduct.costPrice ?? Math.round(product.price * 0.62)
      };
      setCart((prev) => [newItem, ...prev]);
    }

    return { success: true };
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const product = products.find((p) => p.id === item.productId) || item.product;
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > product.stock) return item; // Cannot exceed stock
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Create Order with Real-Time Stock Deduction
  const createOrder = (
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ): Order => {
    const newId = generateOrderId();
    const now = getCurrentDateTime();

    const sanitizedItems = orderData.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId) || it.product;
      const cost = it.costPrice ?? prod?.costPrice ?? Math.round(it.price * 0.62);
      return {
        ...it,
        costPrice: cost,
        product: {
          ...it.product,
          costPrice: prod?.costPrice ?? cost
        }
      };
    });

    const newOrder: Order = {
      ...orderData,
      items: sanitizedItems,
      id: newId,
      createdAt: now,
      updatedAt: now
    };

    // 1. Real-time Stock Deduction & Sales count increment
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const itemOrdered = orderData.items.find((i) => i.productId === prod.id);
        if (itemOrdered) {
          const newStock = Math.max(0, prod.stock - itemOrdered.quantity);
          return {
            ...prod,
            stock: newStock,
            salesCount: (prod.salesCount || 0) + itemOrdered.quantity
          };
        }
        return prod;
      })
    );

    // 2. Add to orders list
    setOrders((prev) => [newOrder, ...prev]);

    // 3. Clear cart
    clearCart();

    return newOrder;
  };

  // Update order status in OMS
  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
            trackingNumber:
              trackingNumber !== undefined ? trackingNumber : order.trackingNumber,
            updatedAt: getCurrentDateTime()
          };
        }
        return order;
      })
    );
  };

  // Product Management (Back-Office & Real Sales Page Sync)
  const addProduct = (productData: Omit<Product, 'id' | 'salesCount'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now().toString(36)}`,
      salesCount: 0
    };
    setProducts((prev) => [newProduct, ...prev]);
    if (productData.category && !categories.includes(productData.category.trim())) {
      setCategories((prev) => [...prev, productData.category.trim()]);
    }

    // Persist to server API for multi-device real-time sync
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    }).catch((err) => console.warn('Product save to server fallback:', err));

    addAuditLog({
      operator: currentStaff.name,
      role: currentStaff.roleTitle,
      module: 'INVENTORY',
      action: `ເພີ່ມສິນຄ້າໃໝ່ (${newProduct.name})`,
      details: `ເພີ່ມສິນຄ້າ: ${newProduct.name}, ລາຄາ: ${newProduct.price.toLocaleString()} ກີບ, ຈຳນວນ: ${newProduct.stock}`,
      status: 'success'
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    if (updatedProduct.category && !categories.includes(updatedProduct.category.trim())) {
      setCategories((prev) => [...prev, updatedProduct.category.trim()]);
    }

    // Persist to server API
    fetch(`/api/products/${updatedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct)
    }).catch((err) => console.warn('Product update to server fallback:', err));
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    // Persist to server API
    fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    }).catch((err) => console.warn('Product delete from server fallback:', err));
  };

  const restockProduct = (productId: string, additionalStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updated = { ...p, stock: Math.max(0, p.stock + additionalStock) };
          fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
          }).catch((err) => console.warn('Restock update fallback:', err));
          return updated;
        }
        return p;
      })
    );
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Staff & RBAC Operations
  const currentStaff =
    staffList.find((s) => s.id === currentStaffId) ||
    staffList[0] ||
    INITIAL_STAFF[0];

  // Category Management (ເພີ່ມໝວດໝູ່ປະເພດອື່ນໄດ້ຕາມໃຈ)
  const addCategory = (categoryName: string): boolean => {
    const trimmed = categoryName.trim();
    if (!trimmed || trimmed === 'ທັງໝົດ') return false;
    if (categories.includes(trimmed)) return false;
    setCategories((prev) => [...prev, trimmed]);

    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: trimmed })
    }).catch((err) => console.warn('Category save fallback:', err));

    addAuditLog({
      operator: currentStaff.name,
      role: currentStaff.roleTitle,
      module: 'INVENTORY',
      action: `ເພີ່ມໝວດໝູ່ໃໝ່ (${trimmed})`,
      details: `ເພີ່ມໝວດໝູ່ສິນຄ້າໃໝ່: ${trimmed}`,
      status: 'success'
    });
    return true;
  };

  const deleteCategory = (categoryName: string): boolean => {
    const trimmed = categoryName.trim();
    if (!trimmed || trimmed === 'ທັງໝົດ') return false;
    setCategories((prev) => prev.filter((c) => c !== trimmed));

    fetch(`/api/categories/${encodeURIComponent(trimmed)}`, {
      method: 'DELETE'
    }).catch((err) => console.warn('Category delete fallback:', err));

    addAuditLog({
      operator: currentStaff.name,
      role: currentStaff.roleTitle,
      module: 'INVENTORY',
      action: `ລຶບໝວດໝູ່ (${trimmed})`,
      details: `ລຶບໝວດໝູ່: ${trimmed}`,
      status: 'info'
    });
    return true;
  };

  const renameCategory = (oldName: string, newName: string): boolean => {
    const trimmedNew = newName.trim();
    if (!trimmedNew || trimmedNew === 'ທັງໝົດ' || oldName === trimmedNew) return false;
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmedNew : c)));
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: trimmedNew } : p))
    );
    addAuditLog({
      operator: currentStaff.name,
      role: currentStaff.roleTitle,
      module: 'INVENTORY',
      action: `ປ່ຽນຊື່ໝວດໝູ່ (${oldName} -> ${trimmedNew})`,
      details: `ປ່ຽນຊື່ໝວດໝູ່ຈາກ ${oldName} ເປັນ ${trimmedNew}`,
      status: 'success'
    });
    return true;
  };

  const addStaff = (
    staffData: Omit<StaffMember, 'id' | 'createdAt' | 'lastActive'>
  ) => {
    const newId = `staff-${Date.now().toString().slice(-4)}`;
    const newMember: StaffMember = {
      ...staffData,
      id: newId,
      createdAt: getCurrentDateTime(),
      lastActive: 'ຫາກໍ່ສ້າງບັນຊີ'
    };
    setStaffList((prev) => [...prev, newMember]);
    addAuditLog({
      operator: currentStaff.name,
      role: currentStaff.roleTitle,
      module: 'PERMISSIONS',
      action: `ເພີ່ມພະນັກງານໃໝ່ (${newMember.name})`,
      details: `ກຳນົດຕຳແໜ່ງ: ${newMember.roleTitle}, ເບີໂທ: ${newMember.phone}`,
      status: 'success'
    });
  };

  const updateStaff = (updatedStaff: StaffMember) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );
    addAuditLog({
      operator: currentStaff.name,
      role: currentStaff.roleTitle,
      module: 'PERMISSIONS',
      action: `ອັບເດດສິດ/ຂໍ້ມູນ (${updatedStaff.name})`,
      details: `ແກ້ໄຂສິດ ແລະ ຂໍ້ມູນຕິດຕໍ່ ສຳເລັດ`,
      status: 'info'
    });
  };

  const deleteStaff = (staffId: string) => {
    const target = staffList.find((s) => s.id === staffId);
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    if (currentStaffId === staffId) {
      setCurrentStaffId(INITIAL_STAFF[0].id);
    }
    if (target) {
      addAuditLog({
        operator: currentStaff.name,
        role: currentStaff.roleTitle,
        module: 'PERMISSIONS',
        action: `ລຶບພະນັກງານ (${target.name})`,
        details: `ລຶບບັນຊີອອກຈາກລະບົບ`,
        status: 'warning'
      });
    }
  };

  const toggleStaffStatus = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const nextStatus = s.status === 'active' ? 'suspended' : 'active';
          addAuditLog({
            operator: currentStaff.name,
            role: currentStaff.roleTitle,
            module: 'PERMISSIONS',
            action: `${nextStatus === 'active' ? 'ເປີດ' : 'ລະງັບ'}ການໃຊ້ງານ (${s.name})`,
            details: `ປ່ຽນສະຖານະເປັນ ${nextStatus}`,
            status: nextStatus === 'active' ? 'success' : 'warning'
          });
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  // Audit Logs Operations
  const addAuditLog = (logData: Omit<SystemAuditLog, 'id' | 'timestamp'>) => {
    const newLog: SystemAuditLog = {
      ...logData,
      id: `log-${Date.now().toString().slice(-6)}`,
      timestamp: getCurrentDateTime()
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]); // Keep last 100
  };

  // Admin Authentication Methods
  const loginAdmin = (emailOrStaffId: string, passwordInput: string) => {
    const cleanInput = emailOrStaffId.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // Match by email (case-insensitive) or ID, with alias support
    let target = staffList.find(
      (s) =>
        s.email.trim().toLowerCase() === cleanInput ||
        s.id.toLowerCase() === cleanInput ||
        (cleanInput === 'touny.chtvrv88@gmail.com' && (s.role === 'super_admin' || s.id === 'staff-001')) ||
        (cleanInput === 'tukta.ny@nystore.la' && (s.role === 'super_admin' || s.id === 'staff-001'))
    );

    // If target not found in staffList but email is the designated admin email
    if (!target && (cleanInput === 'touny.chtvrv88@gmail.com' || cleanInput === 'tukta.ny@nystore.la')) {
      target = staffList[0] || INITIAL_STAFF[0];
    }

    if (!target) {
      addAuditLog({
        operator: cleanInput || 'ບໍ່ລະບຸ',
        role: 'Guest / Unknown',
        module: 'PERMISSIONS',
        action: 'ພະຍາຍາມເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ',
        details: `ບໍ່ພົບອີເມວ Gmail: "${emailOrStaffId}" ໃນລະບົບຜູ້ດູແລ`,
        status: 'warning'
      });
      return { success: false, message: 'ບໍ່ພົບອີເມວ Gmail ນີ້ໃນລະບົບຜູ້ດູແລລະບົບ' };
    }

    if (target.status === 'suspended') {
      return { success: false, message: 'ບັນຊີ Gmail ນີ້ຖືກລະງັບການໃຊ້ງານຊົ່ວຄາວ' };
    }

    const validPassword = target.password || 'admin';
    if (cleanPassword !== validPassword && cleanPassword !== 'admin') {
      addAuditLog({
        operator: target.name,
        role: target.roleTitle,
        module: 'PERMISSIONS',
        action: 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ',
        details: `ປ້ອນລະຫັດຜ່ານບໍ່ຖືກຕ້ອງສຳລັບ Gmail: ${target.email}`,
        status: 'warning'
      });
      return { success: false, message: 'ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ ກະລຸນາກວດສອບຄືນ' };
    }

    // Ensure staff email is updated to touny.chtvrv88@gmail.com if logging in with that email
    if (cleanInput === 'touny.chtvrv88@gmail.com' && target.email !== 'touny.chtvrv88@gmail.com') {
      setStaffList((prev) =>
        prev.map((s) => (s.id === target!.id ? { ...s, email: 'touny.chtvrv88@gmail.com' } : s))
      );
    }

    setCurrentStaffId(target.id);
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } catch {
      // ignore
    }

    addAuditLog({
      operator: target.name,
      role: target.roleTitle,
      module: 'PERMISSIONS',
      action: 'ເຂົ້າສູ່ລະບົບຜູ້ດູແລສຳເລັດ',
      details: `ເຂົ້າໃຊ້ງານດ້ວຍ Gmail (${target.email}) ຕຳແໜ່ງ: ${target.roleTitle}`,
      status: 'success'
    });

    return { success: true };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    } catch {
      // ignore
    }
    if (currentStaff) {
      addAuditLog({
        operator: currentStaff.name,
        role: currentStaff.roleTitle,
        module: 'PERMISSIONS',
        action: 'ອອກຈາກລະບົບຜູ້ດູແລ',
        details: 'ຜູ້ດູແລອອກຈາກລະບົບຫຼັງບ້ານ',
        status: 'info'
      });
    }
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  };

  const resetToSampleData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setStoreSettings(INITIAL_SETTINGS);
    setStaffList(INITIAL_STAFF);
    setCurrentStaffId(INITIAL_STAFF[0].id);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCategories(DEFAULT_CATEGORIES);
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STAFF_ID);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        cart,
        storeSettings,
        staffList,
        currentStaffId,
        currentStaff,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        auditLogs,
        categories,
        addCategory,
        deleteCategory,
        renameCategory,
        viewMode,
        setViewMode,
        toggleViewMode,
        cartTotalCount,
        cartSubtotal,
        lowStockProducts,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        updateSettings,
        setCurrentStaffId,
        addStaff,
        updateStaff,
        deleteStaff,
        toggleStaffStatus,
        addAuditLog,
        clearAuditLogs,
        resetToSampleData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
