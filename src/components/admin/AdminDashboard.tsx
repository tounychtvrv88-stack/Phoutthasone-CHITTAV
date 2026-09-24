import React, { useState } from 'react';
import {
  PackageCheck,
  Boxes,
  DollarSign,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MessageCircle,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  RefreshCw,
  X,
  Image as ImageIcon,
  Save,
  Check,
  Printer,
  Shield,
  Activity,
  Upload,
  LogOut,
  UserCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  Copy,
  Facebook,
  ShieldCheck,
  FileCheck,
  Tag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus, Product, ShippingProvider } from '../../types';
import { formatLAK, createWhatsAppUrl } from '../../utils/format';
import { STATUS_CONFIG, SHIPPING_PROVIDERS_CONFIG, CATEGORIES } from '../../data/initialData';
import { printReceipt } from '../../utils/receipt';
import { PermissionsManager } from './PermissionsManager';
import { SystemStatusMonitor } from './SystemStatusMonitor';
import { AdminLoginPortal } from './AdminLoginPortal';
import { OrderVerificationModal } from './OrderVerificationModal';
import { ProfitReport } from './ProfitReport';
import { NyStoreLogo } from '../NyStoreLogo';
import { optimizeImageFile } from '../../utils/imageOptimizer';

export const AdminDashboard: React.FC<{
  onReturnToShop: () => void;
  onOpenLogin?: () => void;
  onViewProductInShop?: (product: Product) => void;
}> = ({ onReturnToShop, onOpenLogin, onViewProductInShop }) => {
  const {
    orders,
    products,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    lowStockProducts,
    storeSettings,
    updateSettings,
    staffList,
    currentStaff,
    isAdminAuthenticated,
    logoutAdmin,
    categories,
    addCategory,
    deleteCategory,
    renameCategory
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'finance' | 'permissions' | 'system'>('orders');
  const [financeSubTab, setFinanceSubTab] = useState<'profit_report' | 'bcel_settings'>('profit_report');
  const [publishedProductToast, setPublishedProductToast] = useState<{ product: Product; isEdit: boolean } | null>(null);

  // OMS State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);
  const [editingTrackingOrderId, setEditingTrackingOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState<string>('');

  // Product Inventory State
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ທັງໝົດ');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [catMessage, setCatMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Quick Restock modal
  const [restockingProductId, setRestockingProductId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);

  // Financial calculations
  const totalRevenue = orders
    .filter((o) => o.status === 'paid' || o.status === 'packing' || o.status === 'shipped' || o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const completedRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'paid' || o.status === 'pending_payment'
  ).length;

  // Verification & Processing Counts
  const pendingSlipOrders = orders.filter((o) => o.status === 'pending_payment' && !!o.paymentSlipUrl);
  const noSlipOrders = orders.filter((o) => o.status === 'pending_payment' && !o.paymentSlipUrl);
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const packingOrders = orders.filter((o) => o.status === 'packing');
  const shippedOrders = orders.filter((o) => o.status === 'shipped');

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);

    let matchesStatus = true;
    if (orderStatusFilter === 'all') {
      matchesStatus = true;
    } else if (orderStatusFilter === 'pending_slip') {
      matchesStatus = o.status === 'pending_payment' && !!o.paymentSlipUrl;
    } else if (orderStatusFilter === 'no_slip') {
      matchesStatus = o.status === 'pending_payment' && !o.paymentSlipUrl;
    } else {
      matchesStatus = o.status === orderStatusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  // Modal navigation handlers
  const currentVerifyingOrder = orders.find((o) => o.id === verifyingOrderId) || null;
  const verifyingOrderIndex = filteredOrders.findIndex((o) => o.id === verifyingOrderId);
  const hasPrevOrder = verifyingOrderIndex > 0;
  const hasNextOrder = verifyingOrderIndex >= 0 && verifyingOrderIndex < filteredOrders.length - 1;
  const handlePrevOrder = () => {
    if (hasPrevOrder) setVerifyingOrderId(filteredOrders[verifyingOrderIndex - 1].id);
  };
  const handleNextOrder = () => {
    if (hasNextOrder) setVerifyingOrderId(filteredOrders[verifyingOrderIndex + 1].id);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ທັງໝົດ' || p.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = p.stock > 0 && p.stock <= (p.lowStockThreshold || 5);
    } else if (stockFilter === 'out') {
      matchesStock = p.stock <= 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const adminUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname.replace(/\/admin\/?$/, '')}/#admin`
    : 'https://.../#admin';

  const handleCopyAdminLink = () => {
    try {
      navigator.clipboard.writeText(adminUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  if (!isAdminAuthenticated) {
    return <AdminLoginPortal onReturnToShop={onReturnToShop} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <NyStoreLogo variant="icon" size="lg" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold tracking-wide">
                ລະບົບຫຼັງບ້ານ (Back-Office OMS)
              </span>
              {lowStockProducts.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {lowStockProducts.length} ສິນຄ້າໃກ້ໝົດ
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-neutral-900 mt-2">
              ຈັດການຮ້ານຄ້າ {storeSettings.storeName}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              ລະບົບຄຳສັ່ງຊື້ • ຄັງສິນຄ້າ • ຕັດສະຕັອກອັດຕະໂນມັດ • ການເງິນ BCEL One
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Current Logged-in Staff Info */}
          {currentStaff && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <span
                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${currentStaff.avatarColor}`}
              >
                {currentStaff.name.charAt(0)}
              </span>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-neutral-800 leading-tight">{currentStaff.name}</div>
                <div className="text-[10px] text-neutral-400">{currentStaff.roleTitle}</div>
              </div>
            </div>
          )}

          <button
            onClick={onReturnToShop}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-md shadow-pink-200 transition-colors cursor-pointer"
          >
            ກັບໜ້າຮ້ານຄ້າ
          </button>

          <button
            onClick={() => {
              logoutAdmin();
              onReturnToShop();
            }}
            className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="ອອກຈາກລະບົບຜູ້ດູແລ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ອອກຈາກລະບົບ</span>
          </button>
        </div>
      </div>

      {/* Back-Office Direct Link & Connected Data Status Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-pink-950 text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ຂໍ້ມູນເຊື່ອມຕໍ່ແບບ Real-Time ກັບໜ້າຮ້ານຄ້າ
            </span>
            <span className="text-[11px] text-pink-300 font-medium bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30">
              ປົກປ້ອງດ້ວຍລະບົບ Login (Gmail + Password)
            </span>
          </div>
          <div className="text-xs text-neutral-300 flex flex-wrap items-center gap-2">
            <span className="text-neutral-400">ລິ້ງແຍກສະເພາະລະບົບຫຼັງບ້ານ (Direct Admin Link):</span>
            <code className="bg-black/50 px-2.5 py-1 rounded-lg text-pink-300 font-mono text-xs select-all border border-white/10">
              {adminUrl}
            </code>
          </div>
          <p className="text-[11px] text-neutral-400">
            ທ່ານສາມາດບັນທຶກລິ້ງນີ້ໄວ້ (Bookmark) ຫຼື ເປີດໃນແຖບໃໝ່ເພື່ອຈັດການຫຼັງບ້ານ ໂດຍຂໍ້ມູນສິນຄ້າ, ສະຕັອກ, ແລະ ອໍເດີຈະເຊື່ອມຕໍ່ກັນຕະຫຼອດເວລາ
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAdminLink}
            className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-pink-900/30 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>ຄັດລອກລິ້ງແລ້ວ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>ຄັດລອກລິ້ງຫຼັງບ້ານ</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              window.open(window.location.origin + window.location.pathname, '_blank');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="ເປີດໜ້າຮ້ານຄ້າໃນແຖບໃໝ່ເພື່ອທົດສອບການເຊື່ອມຕໍ່ຂໍ້ມູນ"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ເປີດໜ້າຮ້ານໃນແທັບໃໝ່</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-pink-100 pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-neutral-600 hover:text-pink-600 border border-neutral-200'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>1. ລະບົບຈັດການຄຳສັ່ງຊື້ (OMS)</span>
          {pendingOrdersCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-white text-pink-600 font-black">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-neutral-600 hover:text-pink-600 border border-neutral-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>2. ຈັດການສິນຄ້າ & ຄັງສະຕັອກ</span>
          {lowStockProducts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-amber-400 text-amber-950 font-black">
              {lowStockProducts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
            activeTab === 'finance'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-neutral-600 hover:text-pink-600 border border-neutral-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>3. ການເງິນ & ລາຍງານຜົນກຳໄລ</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
            activeTab === 'permissions'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-neutral-600 hover:text-pink-600 border border-neutral-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>4. ຈັດການສິດ & ພະນັກງານ</span>
          <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-purple-100 text-purple-700 font-bold">
            {staffList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
            activeTab === 'system'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
              : 'bg-white text-neutral-600 hover:text-pink-600 border border-neutral-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>5. ກວດສອບສະຖານະລະບົບ</span>
          <span className="relative flex h-2 w-2 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORDER MANAGEMENT SYSTEM (OMS) & PAYMENT VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Verification Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Pending Slip Verification */}
            <div
              onClick={() => setOrderStatusFilter('pending_slip')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                orderStatusFilter === 'pending_slip'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200 ring-2 ring-amber-400'
                  : 'bg-white hover:bg-amber-50/50 text-neutral-800 border-amber-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span className="text-xs font-bold">ລໍຖ້າກວດສອບສະລິບ</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-black ${
                    orderStatusFilter === 'pending_slip'
                      ? 'bg-white text-amber-600'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pendingSlipOrders.length}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black">{pendingSlipOrders.length}</span>
                {pendingSlipOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVerifyingOrderId(pendingSlipOrders[0].id);
                    }}
                    className={`text-xs font-bold underline cursor-pointer ${
                      orderStatusFilter === 'pending_slip' ? 'text-white' : 'text-amber-700'
                    }`}
                  >
                    ກວດສອບດ່ວນ &rarr;
                  </button>
                )}
              </div>
              <p
                className={`text-[11px] mt-1 ${
                  orderStatusFilter === 'pending_slip' ? 'text-amber-100' : 'text-neutral-500'
                }`}
              >
                ອໍເດີ້ທີ່ລູກຄ້າແນບສະລິບ BCEL One ແລ້ວ
              </p>
            </div>

            {/* Card 2: Paid & Ready to Pack */}
            <div
              onClick={() => setOrderStatusFilter('paid')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                orderStatusFilter === 'paid'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-200 ring-2 ring-emerald-400'
                  : 'bg-white hover:bg-emerald-50/50 text-neutral-800 border-emerald-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${orderStatusFilter === 'paid' ? 'text-white' : 'text-emerald-500'}`} />
                  <span className="text-xs font-bold">ຊຳລະແລ້ວ / ລໍຖ້າແພັກ</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-black ${
                    orderStatusFilter === 'paid'
                      ? 'bg-white text-emerald-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {paidOrders.length}
                </span>
              </div>
              <div className="mt-2 text-2xl font-black">{paidOrders.length}</div>
              <p
                className={`text-[11px] mt-1 ${
                  orderStatusFilter === 'paid' ? 'text-emerald-100' : 'text-neutral-500'
                }`}
              >
                ກວດສະລິບຜ່ານແລ້ວ ພ້ອມແພັກກ່ອງ
              </p>
            </div>

            {/* Card 3: Packing & Shipped */}
            <div
              onClick={() => setOrderStatusFilter('shipped')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                orderStatusFilter === 'shipped'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-200 ring-2 ring-blue-400'
                  : 'bg-white hover:bg-blue-50/50 text-neutral-800 border-blue-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className={`w-4 h-4 ${orderStatusFilter === 'shipped' ? 'text-white' : 'text-blue-500'}`} />
                  <span className="text-xs font-bold">ກຳລັງຈັດສົ່ງ</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-black ${
                    orderStatusFilter === 'shipped'
                      ? 'bg-white text-blue-700'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {shippedOrders.length}
                </span>
              </div>
              <div className="mt-2 text-2xl font-black">{shippedOrders.length}</div>
              <p
                className={`text-[11px] mt-1 ${
                  orderStatusFilter === 'shipped' ? 'text-blue-100' : 'text-neutral-500'
                }`}
              >
                ສົ່ງອອກຂົນສົ່ງ Anousith / HAL ແລ້ວ
              </p>
            </div>

            {/* Card 4: Verified Total Revenue */}
            <div className="p-4 rounded-2xl border border-pink-200 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-pink-500" />
                  <span className="text-xs font-bold text-neutral-800">ຍອດຂາຍທີ່ຊຳລະແລ້ວ</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-pink-100 text-pink-700">
                  {orders.length} ອໍເດີ້
                </span>
              </div>
              <div className="mt-2 text-xl sm:text-2xl font-black text-pink-600 font-mono truncate">
                {formatLAK(totalRevenue)}
              </div>
              <p className="text-[11px] mt-1 text-neutral-500">
                ລາຍຮັບຕົວຈິງທີ່ກວດສອບສະລິບແລ້ວ
              </p>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ຄົ້ນຫາຕາມລະຫັດ, ຊື່, ເບີໂທ..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 focus:border-pink-500 outline-hidden font-medium"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setOrderStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 ${
                  orderStatusFilter === 'all'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                ທັງໝົດ ({orders.length})
              </button>

              <button
                onClick={() => setOrderStatusFilter('pending_slip')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  orderStatusFilter === 'pending_slip'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>🟡 ລໍຖ້າກວດສະລິບ</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-amber-800 font-black">
                  {pendingSlipOrders.length}
                </span>
              </button>

              {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const count = orders.filter((o) => o.status === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setOrderStatusFilter(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 ${
                      orderStatusFilter === key
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {config.label} ({count})
                  </button>
                );
              })}

              <button
                onClick={() => setOrderStatusFilter('no_slip')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer shrink-0 ${
                  orderStatusFilter === 'no_slip'
                    ? 'bg-neutral-700 text-white'
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                ບໍ່ມີສະລິບ ({noSlipOrders.length})
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-pink-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pink-50/50 border-b border-pink-100 text-neutral-600 font-bold">
                  <tr>
                    <th className="p-4">ລະຫັດອໍເດີ້ & ວັນທີ</th>
                    <th className="p-4">ຂໍ້ມູນລູກຄ້າ & ທີ່ຢູ່ຈັດສົ່ງ</th>
                    <th className="p-4">ຂົນສົ່ງ & Tracking</th>
                    <th className="p-4">ລາຍການ & ຍອດລວມ</th>
                    <th className="p-4">ສະລິບໂອນເງິນ</th>
                    <th className="p-4">ສະຖານະອໍເດີ້</th>
                    <th className="p-4 text-center">ຈັດການ & ໃບບິນ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400">
                        ບໍ່ພົບລາຍການຄຳສັ່ງຊື້
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;
                      const isEditingTracking = editingTrackingOrderId === order.id;

                      return (
                        <tr key={order.id} className="hover:bg-pink-50/20 transition-colors">
                          {/* Order ID & Date */}
                          <td className="p-4 align-top">
                            <div className="font-mono font-extrabold text-pink-600 text-sm">
                              #{order.id}
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              {order.createdAt}
                            </div>
                            {order.notes && (
                              <div className="mt-1 text-[10px] text-neutral-500 bg-neutral-50 p-1 rounded-sm">
                                ໝາຍເຫດ: {order.notes}
                              </div>
                            )}
                          </td>

                          {/* Customer Name, Phone, Address */}
                          <td className="p-4 align-top max-w-xs">
                            <div className="font-bold text-neutral-900 text-sm">
                              {order.customerName}
                            </div>
                            <div className="text-pink-600 font-mono font-medium">
                              {order.customerPhone}
                            </div>
                            <div className="text-neutral-500 text-[11px] mt-1 line-clamp-2">
                              {order.address}
                            </div>
                          </td>

                          {/* Shipping Provider & Tracking Number */}
                          <td className="p-4 align-top">
                            <span className="font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-md">
                              {order.shippingProvider}
                            </span>
                            <div className="text-[10px] text-neutral-400 mt-1">
                              {SHIPPING_PROVIDERS_CONFIG[order.shippingProvider]?.laoName}
                            </div>

                            {/* Tracking Input / Display */}
                            <div className="mt-2">
                              {isEditingTracking ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    placeholder="ປ້ອນເລກແທຣັກ..."
                                    value={trackingInput}
                                    onChange={(e) => setTrackingInput(e.target.value)}
                                    className="px-2 py-1 text-xs border border-pink-300 rounded-md w-28 outline-hidden"
                                  />
                                  <button
                                    onClick={() => {
                                      updateOrderStatus(order.id, order.status, trackingInput);
                                      setEditingTrackingOrderId(null);
                                    }}
                                    className="p-1 rounded bg-pink-500 text-white cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingTrackingOrderId(null)}
                                    className="p-1 rounded bg-neutral-200 text-neutral-600 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-neutral-700 bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200 text-[11px]">
                                    {order.trackingNumber || 'ຍັງບໍ່ມີເລກ'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingTrackingOrderId(order.id);
                                      setTrackingInput(order.trackingNumber || '');
                                    }}
                                    className="text-pink-500 hover:text-pink-700 cursor-pointer text-[10px]"
                                    title="ແກ້ໄຂເລກແທຣັກ"
                                  >
                                    ແກ້ໄຂ
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Items and Total */}
                          <td className="p-4 align-top">
                            <div className="font-bold text-neutral-900">
                              {formatLAK(order.total)}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              (ສິນຄ້າ {order.items.length} ຢ່າງ)
                            </div>
                            <div className="text-[11px] text-neutral-600 mt-1 space-y-0.5">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="truncate max-w-[160px]">
                                  • {it.product.name} x{it.quantity}
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Payment Slip View */}
                          <td className="p-4 align-top">
                            {order.paymentSlipUrl ? (
                              <div className="space-y-1.5">
                                <button
                                  type="button"
                                  onClick={() => setVerifyingOrderId(order.id)}
                                  className="group relative w-14 h-16 rounded-xl overflow-hidden border border-pink-200 bg-pink-50 shadow-xs cursor-pointer block hover:ring-2 hover:ring-pink-500 transition-all text-left"
                                  title="ຄລິກເພື່ອກວດສອບສະລິບ & ອໍເດີລະອຽດ"
                                >
                                  <img
                                    src={order.paymentSlipUrl}
                                    alt="Slip"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-[9px] font-bold mt-0.5">ກວດສອບ</span>
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setVerifyingOrderId(order.id)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-600 hover:text-pink-700 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3 h-3 text-pink-500" />
                                  <span>ກວດສະລິບ</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-500">
                                  ຍັງບໍ່ມີສະລິບ
                                </span>
                                <div>
                                  <a
                                    href={createWhatsAppUrl(order.customerPhone, order, 'payment_reminder')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-emerald-600 hover:underline inline-flex items-center gap-1"
                                    title="ສົ່ງຂໍ້ຄວາມທວງສະລິບຜ່ານ WhatsApp"
                                  >
                                    <MessageCircle className="w-2.5 h-2.5" />
                                    <span>ທວງສະລິບ</span>
                                  </a>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Order Status Selector */}
                          <td className="p-4 align-top">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, e.target.value as OrderStatus)
                              }
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border outline-hidden cursor-pointer ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
                            >
                              <option value="pending_payment">ລໍຖ້າຊຳລະເງິນ</option>
                              <option value="paid">ຊຳລະແລ້ວ</option>
                              <option value="packing">ກຳລັງແພັກ</option>
                              <option value="shipped">ຈັດສົ່ງແລ້ວ</option>
                              <option value="completed">ສຳເລັດ</option>
                              <option value="cancelled">ຍົກເລີກ</option>
                            </select>
                          </td>

                          {/* Action Buttons: Inspect & Verify, WhatsApp Direct Notify & Print Receipt */}
                          <td className="p-4 align-top text-center">
                            <div className="flex flex-col gap-1.5 items-center w-full min-w-[130px]">
                              {/* Primary Verification Action */}
                              <button
                                type="button"
                                onClick={() => setVerifyingOrderId(order.id)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer w-full"
                                title="ເປີດໜ້າຕ່າງກວດສອບອໍເດີ, ກວດສະລິບ, ປ່ຽນສະຖານະ ແລະ ແຈ້ງລູກຄ້າ"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>ກວດສອບອໍເດີ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => printReceipt(order, storeSettings)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer w-full"
                                title="ພິມໃບບິນຮັບເງິນ / ໃບຈັດສົ່ງພັດສະດຸ"
                              >
                                <Printer className="w-3.5 h-3.5 text-pink-400" />
                                <span>ພິມໃບບິນ</span>
                              </button>

                              <a
                                href={createWhatsAppUrl(order.customerPhone, order, 'customer_notify')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer w-full"
                                title="ສົ່ງຂໍ້ຄວາມອັບເດດສະຖານະຫາລູກຄ້າຜ່ານ WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>ແຈ້ງ WhatsApp</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRODUCT & INVENTORY MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Low stock alert banner if any */}
          {lowStockProducts.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">
                    ແຈ້ງເຕືອນສະຕັອກຕ່ຳ! (Low Stock Warning)
                  </h4>
                  <p className="text-xs text-amber-700">
                    ມີສິນຄ້າ {lowStockProducts.length} ລາຍການ ທີ່ເຫຼືອສະຕັອກ ≤ 5 ຊິ້ນ ກະລຸນາຕື່ມເຄື່ອງ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStockFilter('low')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                ເບິ່ງສິນຄ້າໃກ້ໝົດທັງໝົດ
              </button>
            </div>
          )}

          {/* Controls: Search, Filter, Add Product Button */}
          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາຊື່ສິນຄ້າ..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 focus:border-pink-500 outline-hidden"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white"
              >
                {['ທັງໝົດ', ...categories].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white"
              >
                <option value="all">ສະຕັອກ: ທັງໝົດ</option>
                <option value="low">ສະຕັອກຕ່ຳ (≤5)</option>
                <option value="out">ສິນຄ້າໝົດ (0)</option>
              </select>
            </div>

            {/* Action Buttons: Manage Categories & Add Product */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="w-full sm:w-auto px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                title="ຈັດການ & ເພີ່ມໝວດໝູ່ສິນຄ້າຕາມໃຈ"
              >
                <Tag className="w-4 h-4 text-pink-600" />
                <span>ຈັດການໝວດໝູ່ ({categories.length})</span>
              </button>

              <button
                onClick={() => setIsAddingProduct(true)}
                className="w-full sm:w-auto px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-pink-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>ເພີ່ມສິນຄ້າໃໝ່</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-pink-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-pink-50/50 border-b border-pink-100 text-neutral-600 font-bold">
                  <tr>
                    <th className="p-4">ຮູບສິນຄ້າ</th>
                    <th className="p-4">ຊື່ສິນຄ້າ & ໝວດໝູ່</th>
                    <th className="p-4">ຕົ້ນທຶນ (ກີບ)</th>
                    <th className="p-4">ລາຄາຂາຍ (ກີບ)</th>
                    <th className="p-4">ກຳໄລ / ຊິ້ນ</th>
                    <th className="p-4">ສະຕັອກຄົງເຫຼືອ (Real-time)</th>
                    <th className="p-4">ຕົວເລືອກ (ສີ/ໄຊສ໌)</th>
                    <th className="p-4">ຍອດຂາຍ</th>
                    <th className="p-4 text-center">ຈັດການ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-neutral-400">
                        ບໍ່ພົບລາຍການສິນຄ້າ
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isLowStock = product.stock <= (product.lowStockThreshold || 5);
                      const isOutOfStock = product.stock <= 0;

                      return (
                        <tr key={product.id} className="hover:bg-pink-50/20 transition-colors">
                          {/* Image */}
                          <td className="p-4">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-pink-50 border border-pink-100 group">
                              <img
                                src={product.images[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                              {product.images.length > 1 && (
                                <span
                                  title={`ມີທັງໝົດ ${product.images.length} ຮູບພາບ`}
                                  className="absolute bottom-0 right-0 bg-neutral-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-md flex items-center gap-0.5"
                                >
                                  +{product.images.length - 1}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Name & Category */}
                          <td className="p-4 max-w-xs">
                            <div className="font-bold text-neutral-900 text-sm">
                              {product.name}
                            </div>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 text-[10px] font-medium border border-pink-200">
                              {product.category}
                            </span>
                          </td>

                          {/* Cost Price */}
                          <td className="p-4">
                            <div className="font-mono font-semibold text-neutral-600 text-xs">
                              {formatLAK(product.costPrice ?? Math.round(product.price * 0.62))}
                            </div>
                            <span className="text-[10px] text-neutral-400">ຕົ້ນທຶນ</span>
                          </td>

                          {/* Price */}
                          <td className="p-4">
                            <div className="font-bold text-pink-600 text-sm font-mono">
                              {formatLAK(product.price)}
                            </div>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <div className="text-[11px] text-neutral-400 line-through font-mono">
                                {formatLAK(product.originalPrice)}
                              </div>
                            )}
                          </td>

                          {/* Profit & Margin */}
                          <td className="p-4">
                            {(() => {
                              const cost = product.costPrice ?? Math.round(product.price * 0.62);
                              const profit = product.price - cost;
                              const margin = product.price > 0 ? (profit / product.price) * 100 : 0;
                              return (
                                <div>
                                  <div className="font-mono font-bold text-emerald-700 text-xs">
                                    +{formatLAK(profit)}
                                  </div>
                                  <span
                                    className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                      margin >= 35
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : margin >= 20
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {margin.toFixed(0)}%
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          {/* Real-time Stock with Alert */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-1 rounded-xl font-mono font-bold text-xs ${
                                  isOutOfStock
                                    ? 'bg-rose-100 text-rose-800'
                                    : isLowStock
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {product.stock} ຊິ້ນ
                              </span>

                              <button
                                onClick={() => {
                                  setRestockingProductId(product.id);
                                  setRestockAmount(10);
                                }}
                                className="text-[11px] text-pink-600 hover:text-pink-800 underline font-medium cursor-pointer"
                              >
                                + ເຕີມສະຕັອກ
                              </button>
                            </div>

                            {isLowStock && (
                              <div className="text-[10px] text-amber-600 flex items-center gap-1 mt-1 font-semibold">
                                <AlertTriangle className="w-3 h-3" />
                                <span>ເຕືອນ: ສະຕັອກໃກ້ໝົດ</span>
                              </div>
                            )}
                          </td>

                          {/* Options */}
                          <td className="p-4 max-w-[180px]">
                            {product.options && product.options.length > 0 ? (
                              <div className="space-y-1">
                                {product.options.map((opt, idx) => (
                                  <div key={idx} className="text-[11px] text-neutral-600">
                                    <span className="font-semibold">{opt.name}:</span> {opt.values.join(', ')}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-neutral-400 text-[11px]">-</span>
                            )}
                          </td>

                          {/* Sales Count */}
                          <td className="p-4">
                            <span className="font-semibold text-neutral-700">
                              {product.salesCount || 0}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  if (onViewProductInShop) {
                                    onViewProductInShop(product);
                                  } else {
                                    onReturnToShop();
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs border border-pink-200/60"
                                title="ເບິ່ງສິນຄ້າໜ້າຂາຍ (View on Sales Page)"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">ເບິ່ງໜ້າຂາຍ</span>
                              </button>
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="p-1.5 rounded-xl bg-neutral-100 hover:bg-pink-100 text-neutral-700 hover:text-pink-600 transition-colors cursor-pointer"
                                title="ແກ້ໄຂສິນຄ້າ"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`ທ່ານຕ້ອງການລຶບສິນຄ້າ "${product.name}" ແທ້ຫຼືບໍ່?`)) {
                                    deleteProduct(product.id);
                                  }
                                }}
                                className="p-1.5 rounded-xl bg-neutral-100 hover:bg-rose-100 text-neutral-700 hover:text-rose-600 transition-colors cursor-pointer"
                                title="ລຶບສິນຄ້າ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PAYMENT & FINANCIALS (BCEL ONE & REVENUE & PROFIT REPORT) */}
      {/* ========================================================================= */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-Tabs for Finance Navigation */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-pink-50/80 border border-pink-100 max-w-fit">
            <button
              onClick={() => setFinanceSubTab('profit_report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                financeSubTab === 'profit_report'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-pink-600 bg-transparent'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>1. ລາຍງານຜົນກຳໄລ & ຕົ້ນທຶນ (Profit & Loss Report)</span>
            </button>

            <button
              onClick={() => setFinanceSubTab('bcel_settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                financeSubTab === 'bcel_settings'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-pink-600 bg-transparent'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>2. ຕັ້ງຄ່າການຊຳລະ BCEL One & ຂໍ້ມູນຮ້ານ</span>
            </button>
          </div>

          {/* Sub-Tab 1: Profit & Loss Report Component */}
          {financeSubTab === 'profit_report' && (
            <ProfitReport onInspectOrder={(orderId) => setVerifyingOrderId(orderId)} />
          )}

          {/* Sub-Tab 2: BCEL Configuration & Revenue Stats */}
          {financeSubTab === 'bcel_settings' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Revenue Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500">
                      ຍອດຂາຍລວມທັງໝົດ (Total Revenue)
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900">
                    {formatLAK(totalRevenue)}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    ລວມທຸກອໍເດີ້ທີ່ຊຳລະແລ້ວຜ່ານ BCEL One
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500">
                      ຈຳນວນອໍເດີ້ທັງໝົດ
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                      <PackageCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900">
                    {orders.length} ອໍເດີ້
                  </div>
                  <p className="text-[11px] text-pink-600 font-medium">
                    ລໍຖ້າດຳເນີນການ: {pendingOrdersCount} ອໍເດີ້
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500">
                      ຍອດຈັດສົ່ງສຳເລັດ (Completed)
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-neutral-900">
                    {formatLAK(completedRevenue)}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    ອໍເດີ້ທີ່ລູກຄ້າໄດ້ຮັບສິນຄ້າແລ້ວ
                  </p>
                </div>
              </div>

          {/* BCEL One Configuration Card */}
          <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-pink-100">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                BCEL
              </div>
              <div>
                <h3 className="font-extrabold text-base text-neutral-900">
                  ຕັ້ງຄ່າການຊຳລະເງິນ BCEL One (Payment Gateway)
                </h3>
                <p className="text-xs text-neutral-500">
                  ກຳນົດຊື່ບັນຊີ, ເລກບັນຊີ BCEL One ເພື່ອສະແດງໃນໜ້າຊຳລະເງິນ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  ຊື່ບັນຊີ BCEL (Account Name):
                </label>
                <input
                  type="text"
                  value={storeSettings.bcelAccountName}
                  onChange={(e) => updateSettings({ bcelAccountName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  ເລກບັນຊີ BCEL (Account Number):
                </label>
                <input
                  type="text"
                  value={storeSettings.bcelAccountNumber}
                  onChange={(e) => updateSettings({ bcelAccountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  ເບີ WhatsApp ຮ້ານຄ້າ (ສຳລັບຮັບແຈ້ງເຕືອນ):
                </label>
                <input
                  type="text"
                  value={storeSettings.whatsappNumber}
                  onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  ເບີໂທຕິດຕໍ່ຮ້ານ:
                </label>
                <input
                  type="text"
                  value={storeSettings.storePhone}
                  onChange={(e) => updateSettings({ storePhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden"
                />
              </div>

              {/* Facebook Channel Settings */}
              <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-pink-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Facebook className="w-3.5 h-3.5 fill-white text-white" />
                  </div>
                  <label className="text-xs font-bold text-neutral-800">
                    ຊ່ອງທາງຕິດຕໍ່ FACEBOOK ຮ້ານຄ້າ
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-neutral-500">ຊື່ເພຈ Facebook (Page Name):</span>
                    <input
                      type="text"
                      value={storeSettings.facebookPageName || ''}
                      onChange={(e) => updateSettings({ facebookPageName: e.target.value })}
                      placeholder="NY Beauty SHop"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden font-semibold text-blue-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-neutral-500">ລິ້ງ Facebook (URL / Share Link):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={storeSettings.facebookUrl || ''}
                        onChange={(e) => updateSettings({ facebookUrl: e.target.value })}
                        placeholder="https://www.facebook.com/..."
                        className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden font-mono text-xs"
                      />
                      {storeSettings.facebookUrl && (
                        <a
                          href={storeSettings.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 shrink-0 border border-blue-200"
                          title="ທົດສອບເປີດລິ້ງ Facebook"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>ເປີດ</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BCEL QR Code Image */}
              <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-pink-100">
                <label className="text-xs font-semibold text-neutral-700 block">
                  ຮູບພາບ QR Code BCEL OnePay:
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-28 h-36 border border-pink-200 rounded-xl overflow-hidden bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                    <img
                      src={storeSettings.bcelQrImage || '/bcel-qr.jpg'}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ອັບໂຫຼດຮູບ QR Code ໃໝ່</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                updateSettings({ bcelQrImage: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {storeSettings.bcelQrImage !== '/bcel-qr.jpg' && (
                        <button
                          type="button"
                          onClick={() => updateSettings({ bcelQrImage: '/bcel-qr.jpg' })}
                          className="text-xs text-neutral-500 hover:text-rose-600 underline"
                        >
                          ໃຊ້ຮູບເລີ່ມຕົ້ນ
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      ຮູບ QR Code ນີ້ຈະຖືກສະແດງໃນໜ້າຊຳລະເງິນ (Checkout) ໃຫ້ລູກຄ້າສະແກນຈ່າຍດ້ວຍ BCEL One
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )}

      {/* ========================================================================= */}
      {/* 4. PERMISSIONS & ROLE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="animate-fadeIn">
          <PermissionsManager />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SYSTEM STATUS MONITOR & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'system' && (
        <div className="animate-fadeIn">
          <SystemStatusMonitor />
        </div>
      )}

      {/* =================== ORDER VERIFICATION & PAYMENT MODAL =================== */}
      <OrderVerificationModal
        order={currentVerifyingOrder}
        isOpen={!!verifyingOrderId}
        onClose={() => setVerifyingOrderId(null)}
        onUpdateStatus={updateOrderStatus}
        storeSettings={storeSettings}
        onNextOrder={handleNextOrder}
        onPrevOrder={handlePrevOrder}
        hasNext={hasNextOrder}
        hasPrev={hasPrevOrder}
      />

      {/* =================== SLIP PREVIEW MODAL =================== */}
      {selectedSlipUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-base text-neutral-800">
                ໃບສະລິບການໂອນ BCEL One
              </h3>
              <button
                onClick={() => setSelectedSlipUrl(null)}
                className="p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-50">
              <img
                src={selectedSlipUrl}
                alt="Payment slip preview"
                className="w-full object-contain"
              />
            </div>
            <button
              onClick={() => setSelectedSlipUrl(null)}
              className="w-full py-2.5 rounded-xl bg-pink-500 text-white font-bold text-xs cursor-pointer hover:bg-pink-600"
            >
              ປິດ
            </button>
          </div>
        </div>
      )}

      {/* =================== QUICK RESTOCK MODAL =================== */}
      {restockingProductId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-pink-100 space-y-4 text-center">
            <h3 className="font-bold text-base text-neutral-900">
              ເຕີມສະຕັອກສິນຄ້າ
            </h3>
            <p className="text-xs text-neutral-500">
              {products.find((p) => p.id === restockingProductId)?.name}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setRestockAmount((a) => Math.max(1, a - 5))}
                className="w-10 h-10 rounded-xl bg-neutral-100 font-bold hover:bg-pink-100 cursor-pointer"
              >
                -5
              </button>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, Number(e.target.value) || 1))}
                className="w-20 text-center font-bold text-lg border border-pink-300 rounded-xl py-1.5"
              />
              <button
                onClick={() => setRestockAmount((a) => a + 5)}
                className="w-10 h-10 rounded-xl bg-neutral-100 font-bold hover:bg-pink-100 cursor-pointer"
              >
                +5
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRestockingProductId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold cursor-pointer"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={() => {
                  restockProduct(restockingProductId, restockAmount);
                  setRestockingProductId(null);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer shadow-md shadow-pink-200"
              >
                ຢືນຢັນເຕີມ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== CATEGORY MANAGEMENT MODAL =================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-neutral-900">
                    ຈັດການໝວດໝູ່ສິນຄ້າ
                  </h3>
                  <p className="text-xs text-neutral-500">
                    ເພີ່ມໝວດໝູ່ປະເພດອື່ນໄດ້ຕາມໃຈ ຫຼື ລຶບໝວດໝູ່ທີ່ບໍ່ຕ້ອງການ
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setCatMessage(null);
                  setNewCatInput('');
                }}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input to add new category */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCatInput.trim()) return;
                const ok = addCategory(newCatInput.trim());
                if (ok) {
                  setCatMessage({
                    text: `ເພີ່ມໝວດໝູ່ "${newCatInput.trim()}" ສຳເລັດແລ້ວ!`,
                    type: 'success'
                  });
                  setNewCatInput('');
                } else {
                  setCatMessage({
                    text: `ໝວດໝູ່ "${newCatInput.trim()}" ມີຢູ່ແລ້ວ`,
                    type: 'error'
                  });
                }
              }}
              className="space-y-2"
            >
              <label className="text-xs font-bold text-neutral-700">
                ເພີ່ມໝວດໝູ່ໃໝ່ (Custom Category):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="ພິມຊື່ໝວດໝູ່ໃໝ່ ເຊັ່ນ: ອາຫານເສີມ, ນ້ຳຫອມ, ເກີບ..."
                  value={newCatInput}
                  onChange={(e) => {
                    setNewCatInput(e.target.value);
                    if (catMessage) setCatMessage(null);
                  }}
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden font-medium"
                />
                <button
                  type="submit"
                  disabled={!newCatInput.trim()}
                  className="px-4 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-pink-200 cursor-pointer transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>ເພີ່ມ</span>
                </button>
              </div>

              {catMessage && (
                <div
                  className={`text-xs px-3 py-1.5 rounded-lg ${
                    catMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {catMessage.text}
                </div>
              )}
            </form>

            {/* Quick add popular categories */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-neutral-400 font-semibold">
                ແນະນຳໝວດໝູ່ຍອດນິຍົມ (ກົດເພື່ອເພີ່ມທັນທີ):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'ອາຫານເສີມ',
                  'ນ້ຳຫອມ',
                  'ເກີບ & ສົ້ນສູງ',
                  'ເຄື່ອງປະດັບ',
                  'ຜະລິດຕະພັນຜົມ',
                  'ສະບູ & ຄຣີມອາບນ້ຳ',
                  'ອຸປະກອນແຕ່ງໜ້າ',
                  'ຊຸດນອນ'
                ].map((sug) => {
                  const already = categories.includes(sug);
                  return (
                    <button
                      key={sug}
                      type="button"
                      disabled={already}
                      onClick={() => {
                        const ok = addCategory(sug);
                        if (ok) {
                          setCatMessage({
                            text: `ເພີ່ມໝວດໝູ່ "${sug}" ສຳເລັດແລ້ວ!`,
                            type: 'success'
                          });
                        }
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                        already
                          ? 'bg-neutral-100 text-neutral-400 cursor-default'
                          : 'bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 cursor-pointer'
                      }`}
                    >
                      {already ? `✓ ${sug}` : `+ ${sug}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Categories List */}
            <div className="space-y-2 pt-2 border-t border-pink-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700">
                  ລາຍການໝວດໝູ່ທັງໝົດ ({categories.length} ໝວດໝູ່)
                </span>
                <span className="text-[11px] text-neutral-400">
                  ສະແດງໃນໜ້າຮ້ານທັນທີ
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {categories.map((c) => {
                  const prodCount = products.filter((p) => p.category === c).length;
                  return (
                    <div
                      key={c}
                      className="flex items-center justify-between p-2.5 bg-neutral-50 hover:bg-pink-50/50 rounded-xl border border-neutral-200/80 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        <span className="text-xs font-bold text-neutral-800">{c}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200/70 text-neutral-600 font-semibold">
                          {prodCount} ສິນຄ້າ
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (prodCount > 0) {
                            if (
                              !window.confirm(
                                `ໝວດໝູ່ "${c}" ມີສິນຄ້າຢູ່ ${prodCount} ລາຍການ. ທ່ານຕ້ອງການລຶບແທ້ບໍ?`
                              )
                            ) {
                              return;
                            }
                          }
                          deleteCategory(c);
                          setCatMessage({
                            text: `ລຶບໝວດໝູ່ "${c}" ແລ້ວ`,
                            type: 'success'
                          });
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title={`ລຶບໝວດໝູ່ ${c}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setCatMessage(null);
                }}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                ປິດໜ້າຕ່າງ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================== ADD / EDIT PRODUCT MODAL =================== */}
      {(isAddingProduct || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsAddingProduct(false);
            setEditingProduct(null);
          }}
          onSave={(prodData) => {
            if (editingProduct) {
              const updated = { ...editingProduct, ...prodData };
              updateProduct(updated);
              setPublishedProductToast({ product: updated, isEdit: true });
            } else {
              const newProd: Product = {
                ...prodData,
                id: `prod-${Date.now().toString(36)}`,
                salesCount: 0
              };
              addProduct(prodData);
              setPublishedProductToast({ product: newProd, isEdit: false });
            }
            setIsAddingProduct(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* =================== PRODUCT PUBLISHED SUCCESS NOTIFICATION =================== */}
      {publishedProductToast && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-pink-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                {publishedProductToast.isEdit ? 'ອັບເດດຂໍ້ມູນສຳເລັດ' : 'ເພີ່ມສິນຄ້າໃໝ່ສຳເລັດ'}
              </span>
              <h3 className="text-lg font-black text-neutral-900">
                ອັບເດດລົງໜ້າຂາຍຮຽບຮ້ອຍແລ້ວ! 🌸
              </h3>
              <p className="text-xs text-neutral-600">
                ສິນຄ້າ <strong>"{publishedProductToast.product.name}"</strong> ພ້ອມຂາຍຢູ່ໜ້າຮ້ານແລ້ວ ແລະ ລູກຄ້າສາມາດກົດສັ່ງຊື້ໄດ້ທັນທີ
              </p>
            </div>

            <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100 flex items-center gap-3 text-left">
              <img
                src={publishedProductToast.product.images?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-pink-200"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-neutral-900 truncate">
                  {publishedProductToast.product.name}
                </div>
                <div className="text-[11px] text-pink-600 font-semibold">
                  ລາຄາຂາຍ: {formatLAK(publishedProductToast.product.price)}
                </div>
                <div className="text-[10px] text-neutral-500">
                  ສະຕັອກ: {publishedProductToast.product.stock} ຊິ້ນ • ໝວດໝູ່: {publishedProductToast.product.category}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                onClick={() => {
                  const prod = publishedProductToast.product;
                  setPublishedProductToast(null);
                  if (onViewProductInShop) {
                    onViewProductInShop(prod);
                  } else {
                    onReturnToShop();
                  }
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>ໄປເບິ່ງໜ້າຮ້ານທັນທີ (View on Live Shop)</span>
              </button>

              <button
                onClick={() => {
                  setPublishedProductToast(null);
                  setIsAddingProduct(true);
                }}
                className="w-full sm:w-auto py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors whitespace-nowrap"
              >
                + ເພີ່ມອີກ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Product Form Modal with Multi-Image Support
interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Omit<Product, 'id' | 'salesCount'>) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  onClose,
  onSave
}) => {
  const { categories, addCategory } = useStore();
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(
    product?.category || (categories[0] || 'ບຳລຸງຜິວ')
  );
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [price, setPrice] = useState(product?.price || 100000);
  const [costPrice, setCostPrice] = useState(
    product?.costPrice ?? (product?.price ? Math.round(product.price * 0.62) : 60000)
  );
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice || 0);
  const [stock, setStock] = useState(product?.stock || 20);
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold || 5);
  const [description, setDescription] = useState(product?.description || '');

  // Multi-image state
  const [images, setImages] = useState<string[]>(() => {
    if (product?.images && product.images.length > 0) {
      return [...product.images];
    }
    return [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
    ];
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  const [option1Name, setOption1Name] = useState(product?.options?.[0]?.name || 'ຂະໜາດ');
  const [option1Values, setOption1Values] = useState(product?.options?.[0]?.values.join(', ') || '30ml, 50ml');
  const [option2Name, setOption2Name] = useState(product?.options?.[1]?.name || 'ສີ');
  const [option2Values, setOption2Values] = useState(product?.options?.[1]?.values.join(', ') || 'ຊົມພູອ່ອນ, ຂາວ');

  // Multi-image handlers with automatic compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageError('');
    setIsUploading(true);

    try {
      const fileList = Array.from(files);
      const newImages: string[] = [];

      for (const file of fileList) {
        if (!file.type.startsWith('image/')) continue;
        try {
          // Compress photo to lightweight web format (under 60KB) to ensure instant rendering and persistence
          const optimized = await optimizeImageFile(file, {
            maxWidth: 900,
            maxHeight: 900,
            quality: 0.82
          });
          newImages.push(optimized);
        } catch (err) {
          console.error('Failed to compress image:', err);
        }
      }

      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch {
      setImageError('ເກີດຂໍ້ຜິດພາດໃນການອັບໂຫຼດຮູບພາບ');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = newImageUrl.trim();
    if (!url) return;
    setImages((prev) => [...prev, url]);
    setNewImageUrl('');
    setImageError('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (images.length <= 1) {
      setImageError('ສິນຄ້າຕ້ອງມີຢ່າງໜ້ອຍ 1 ຮູບພາບ');
      return;
    }
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImageError('');
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validImages = images.map((img) => img.trim()).filter(Boolean);
    if (validImages.length === 0) {
      setImageError('ກະລຸນາເພີ່ມຢ່າງໜ້ອຍ 1 ຮູບພາບສຳລັບສິນຄ້າ');
      return;
    }

    const options = [];
    if (option1Name.trim() && option1Values.trim()) {
      options.push({
        name: option1Name.trim(),
        values: option1Values.split(',').map((v) => v.trim()).filter(Boolean)
      });
    }
    if (option2Name.trim() && option2Values.trim()) {
      options.push({
        name: option2Name.trim(),
        values: option2Values.split(',').map((v) => v.trim()).filter(Boolean)
      });
    }

    const finalCategory = isCustomCategory && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category;

    if (isCustomCategory && customCategoryInput.trim()) {
      addCategory(customCategoryInput.trim());
    }

    onSave({
      name: name.trim(),
      category: finalCategory,
      price: Number(price),
      costPrice: Number(costPrice),
      originalPrice: Number(originalPrice) > 0 ? Number(originalPrice) : undefined,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      description: description.trim(),
      images: validImages,
      options,
      isPromo: Number(originalPrice) > Number(price)
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div>
            <h3 className="font-bold text-lg text-neutral-900">
              {product ? 'ແກ້ໄຂສິນຄ້າ' : 'ເພີ່ມສິນຄ້າໃໝ່'}
            </h3>
            <p className="text-xs text-neutral-500">
              ຮອງຮັບການເພີ່ມຫຼາຍຮູບພາບ, ອັບໂຫຼດໄຟລ໌ ແລະ ຈັດລຽງຮູບໜ້າປົກ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Basic Info: Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-neutral-700">ຊື່ສິນຄ້າ *</label>
              <input
                type="text"
                required
                placeholder="ເຊັ່ນ: ເຊລັ່ມບຳລຸງຜິວ Glow Essence"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden font-medium"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-neutral-700">ໝວດໝູ່ *</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(!isCustomCategory);
                    if (!isCustomCategory) setCustomCategoryInput('');
                  }}
                  className="text-[11px] text-pink-600 hover:text-pink-700 font-bold underline cursor-pointer"
                >
                  {isCustomCategory ? 'ເລືອກຈາກລາຍການ' : '+ ພິມໝວດໝູ່ໃໝ່'}
                </button>
              </div>

              {isCustomCategory ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="ພິມຊື່ໝວດໝູ່ໃໝ່ ເຊັ່ນ: ອາຫານເສີມ..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-300 bg-pink-50/40 focus:border-pink-500 outline-hidden font-medium"
                    autoFocus
                  />
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setIsCustomCategory(true);
                      setCustomCategoryInput('');
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-white focus:border-pink-500 outline-hidden font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__add_new__" className="text-pink-600 font-bold">
                    + ເພີ່ມໝວດໝູ່ໃໝ່ (ພິມເອງ)...
                  </option>
                </select>
              )}
            </div>
          </div>

          {/* MULTI-IMAGE MANAGEMENT SECTION */}
          <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-pink-600" />
                <label className="font-bold text-neutral-800 text-sm">
                  ຮູບພາບສິນຄ້າ (Product Images)
                </label>
                <span className="px-2 py-0.5 rounded-full text-[11px] bg-pink-100 text-pink-700 font-bold">
                  {images.length} ຮູບ
                </span>
              </div>
              <span className="text-[11px] text-neutral-500">
                ⭐ ຮູບທຳອິດຈະຖືກໃຊ້ເປັນຮູບໜ້າປົກຫຼັກ
              </span>
            </div>

            {imageError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {imageError}
              </div>
            )}

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-xl overflow-hidden border-2 bg-white shadow-xs transition-all ${
                    idx === 0
                      ? 'border-pink-500 ring-2 ring-pink-200'
                      : 'border-neutral-200 hover:border-pink-300'
                  }`}
                >
                  <div className="aspect-square w-full bg-neutral-100 overflow-hidden relative">
                    <img
                      src={img}
                      alt={`ຮູບສິນຄ້າ ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Primary Badge */}
                    {idx === 0 ? (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-pink-600 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        ຮູບໜ້າປົກ
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-neutral-900/70 hover:bg-pink-600 text-white text-[9px] font-medium transition-colors cursor-pointer"
                        title="ຕັ້ງເປັນຮູບໜ້າປົກຫຼັກ"
                      >
                        ຕັ້ງເປັນຮູບຫຼັກ
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/90 hover:bg-rose-600 text-neutral-600 hover:text-white shadow-xs transition-colors cursor-pointer"
                      title="ລົບຮູບນີ້"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Ordering Controls */}
                  <div className="px-2 py-1 bg-neutral-50 flex items-center justify-between border-t border-neutral-100 text-[10px] text-neutral-500">
                    <span>#{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveImage(idx, 'left')}
                        className="p-0.5 rounded hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="ຍ້າຍໄປທາງຊ້າຍ"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMoveImage(idx, 'right')}
                        className="p-0.5 rounded hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="ຍ້າຍໄປທາງຂວາ"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions to add more images: Upload or URL */}
            <div className="pt-2 border-t border-pink-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* File Upload Button */}
              <div>
                <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-dashed border-pink-400 bg-white hover:bg-pink-50 text-pink-700 font-semibold transition-all cursor-pointer shadow-xs">
                  <Upload className="w-4 h-4 text-pink-600 shrink-0" />
                  <span>
                    {isUploading ? 'ກຳລັງອັບໂຫຼດ...' : '📤 ອັບໂຫຼດຮູບຈາກເຄື່ອງ (ເລືອກໄດ້ຫຼາຍຮູບ)'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-neutral-400 mt-1 text-center">
                  ຮອງຮັບ JPG, PNG, WEBP (ສາມາດເລືອກພ້ອມກັນຫຼາຍຮູບ)
                </p>
              </div>

              {/* URL Input */}
              <div>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="url"
                      placeholder="ຫຼື ວາງລິ້ງ URL ຮູບພາບ..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-neutral-200 bg-white focus:border-pink-500 outline-hidden text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl()}
                    disabled={!newImageUrl.trim()}
                    className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ເພີ່ມ</span>
                  </button>
                </div>
                <p className="text-[10px] text-neutral-400 mt-1 text-center">
                  ກົດ Enter ຫຼື ຄລິກ "ເພີ່ມ" ເພື່ອນຳເຂົ້າ URL
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Cost Calculation */}
          <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">ລາຄາຕົ້ນທຶນ (ກີບ) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  placeholder="ເຊັ່ນ: 110000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white focus:border-pink-500 outline-hidden font-mono font-bold text-neutral-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">ລາຄາຂາຍ (ກີບ) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="ເຊັ່ນ: 185000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-pink-200 bg-white focus:border-pink-500 outline-hidden font-mono font-bold text-pink-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700">ລາຄາປົກກະຕິ (ໂປຣ)</label>
                <input
                  type="number"
                  min={0}
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  placeholder="ປ້າຍລາຄາເດີມ"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white focus:border-pink-500 outline-hidden font-mono text-neutral-500"
                />
              </div>
            </div>

            {/* Live Profit Preview */}
            {(() => {
              const profitPerUnit = price - costPrice;
              const marginPct = price > 0 ? (profitPerUnit / price) * 100 : 0;
              return (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 font-medium">ກຳໄລຄາດຄະເນຕໍ່ຊິ້ນ:</span>
                    <span className={`font-mono font-bold text-sm ${profitPerUnit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {profitPerUnit >= 0 ? `+${formatLAK(profitPerUnit)}` : formatLAK(profitPerUnit)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-500 font-medium">ອັດຕາກຳໄລ:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                        marginPct >= 35
                          ? 'bg-emerald-100 text-emerald-800'
                          : marginPct >= 15
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {marginPct.toFixed(1)}% Margin
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">ຈຳນວນສະຕັອກ (Stock)</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">ຈຸດເຕືອນສະຕັອກຕ່ຳ (Alert)</label>
              <input
                type="number"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-pink-500 outline-hidden"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-neutral-700">ລາຍລະອຽດສິນຄ້າ</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ບອກລາຍລະອຽດ, ຄຸນສົມບັດ, ວິທີໃຊ້..."
              className="w-full px-3.5 py-2 rounded-xl border border-pink-200 focus:border-pink-500 outline-hidden resize-none"
            />
          </div>

          {/* Product Options */}
          <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
            <span className="font-bold text-neutral-800">ຕົວເລືອກສິນຄ້າ (ສີ, ໄຊສ໌, ຂະໜາດ):</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="ຊື່ຕົວເລືອກ 1 (ເຊັ່ນ: ຂະໜາດ)"
                value={option1Name}
                onChange={(e) => setOption1Name(e.target.value)}
                className="col-span-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white"
              />
              <input
                type="text"
                placeholder="ຄ່າຕົວເລືອກ ແຍກດ້ວຍຈຸດ (ເຊັ່ນ: 30ml, 50ml)"
                value={option1Values}
                onChange={(e) => setOption1Values(e.target.value)}
                className="col-span-2 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="ຊື່ຕົວເລືອກ 2 (ເຊັ່ນ: ສີ)"
                value={option2Name}
                onChange={(e) => setOption2Name(e.target.value)}
                className="col-span-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white"
              />
              <input
                type="text"
                placeholder="ຄ່າຕົວເລືອກ ແຍກດ້ວຍຈຸດ (ເຊັ່ນ: ຊົມພູ, ຂາວ)"
                value={option2Values}
                onChange={(e) => setOption2Values(e.target.value)}
                className="col-span-2 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 font-semibold cursor-pointer transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="w-1/2 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold shadow-md shadow-pink-200 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>ບັນທຶກສິນຄ້າ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
