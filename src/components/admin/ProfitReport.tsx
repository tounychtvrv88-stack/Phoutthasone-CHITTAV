import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Percent,
  Layers,
  BarChart3,
  Search,
  ArrowUpDown,
  Coins
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, Order } from '../../types';
import { formatLAK } from '../../utils/format';

interface ProfitReportProps {
  onInspectOrder?: (orderId: string) => void;
}

type TimeRange = 'all' | 'today' | '7days' | 'this_month';
type StatusFilter = 'paid_only' | 'all';
type ViewMode = 'products' | 'orders';

export const ProfitReport: React.FC<ProfitReportProps> = ({ onInspectOrder }) => {
  const { products, orders, storeSettings } = useStore();

  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('paid_only');
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [productSortKey, setProductSortKey] = useState<'profit' | 'revenue' | 'units' | 'margin'>('profit');
  const [productSortOrder, setProductSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filter orders by time range and status
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return orders.filter((order) => {
      // Status filter
      if (statusFilter === 'paid_only') {
        const isPaid = ['paid', 'packing', 'shipped', 'completed'].includes(order.status);
        if (!isPaid) return false;
      }

      // Time range filter
      if (timeRange === 'all') return true;

      // Parse order date (format: "YYYY-MM-DD HH:mm" or ISO)
      const orderDate = new Date(order.createdAt.replace(' ', 'T'));
      if (isNaN(orderDate.getTime())) return true;

      if (timeRange === 'today') {
        return orderDate >= todayStart;
      } else if (timeRange === '7days') {
        return orderDate >= sevenDaysAgo;
      } else if (timeRange === 'this_month') {
        return orderDate >= monthStart;
      }
      return true;
    });
  }, [orders, timeRange, statusFilter]);

  // Overall Financial Calculations from filtered orders
  const financialSummary = useMemo(() => {
    let totalRevenue = 0; // Selling price sum of products
    let totalCost = 0;    // Cost price sum of products
    let totalShippingCollected = 0;
    let totalUnitsSold = 0;

    filteredOrders.forEach((order) => {
      totalShippingCollected += order.shippingFee || 0;

      order.items.forEach((item) => {
        const qty = item.quantity || 1;
        const itemPrice = item.price || 0;
        // Cost: from item snapshot or product
        const matchedProduct = products.find((p) => p.id === item.productId);
        const itemCost = item.costPrice ?? matchedProduct?.costPrice ?? Math.round(itemPrice * 0.62);

        totalRevenue += itemPrice * qty;
        totalCost += itemCost * qty;
        totalUnitsSold += qty;
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin,
      totalShippingCollected,
      totalUnitsSold,
      orderCount: filteredOrders.length
    };
  }, [filteredOrders, products]);

  // Real-time Inventory Asset Valuation (Cost & Potential Sales)
  const inventoryValuation = useMemo(() => {
    let totalStockUnits = 0;
    let totalStockCost = 0;
    let totalStockRetail = 0;

    products.forEach((p) => {
      const stock = Math.max(0, p.stock || 0);
      const cost = p.costPrice ?? Math.round(p.price * 0.62);
      const retail = p.price || 0;

      totalStockUnits += stock;
      totalStockCost += stock * cost;
      totalStockRetail += stock * retail;
    });

    const unrealizedProfit = totalStockRetail - totalStockCost;
    const expectedMargin = totalStockRetail > 0 ? (unrealizedProfit / totalStockRetail) * 100 : 0;

    return {
      totalStockUnits,
      totalStockCost,
      totalStockRetail,
      unrealizedProfit,
      expectedMargin
    };
  }, [products]);

  // Product-by-Product Profit Analysis
  const productProfitList = useMemo(() => {
    const map = new Map<
      string,
      {
        product: Product;
        unitsSold: number;
        revenue: number;
        cost: number;
        grossProfit: number;
        profitMargin: number;
      }
    >();

    // Initialize with all products
    products.forEach((p) => {
      map.set(p.id, {
        product: p,
        unitsSold: 0,
        revenue: 0,
        cost: 0,
        grossProfit: 0,
        profitMargin: 0
      });
    });

    // Accumulate from filtered orders
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const entry = map.get(item.productId);
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const matchedProduct = entry?.product || products.find((p) => p.id === item.productId);
        const cost = item.costPrice ?? matchedProduct?.costPrice ?? Math.round(price * 0.62);

        if (entry) {
          entry.unitsSold += qty;
          entry.revenue += price * qty;
          entry.cost += cost * qty;
        } else if (matchedProduct) {
          map.set(item.productId, {
            product: matchedProduct,
            unitsSold: qty,
            revenue: price * qty,
            cost: cost * qty,
            grossProfit: 0,
            profitMargin: 0
          });
        }
      });
    });

    // Compute margins
    const list = Array.from(map.values()).map((entry) => {
      const grossProfit = entry.revenue - entry.cost;
      const profitMargin = entry.revenue > 0 ? (grossProfit / entry.revenue) * 100 : 0;
      return {
        ...entry,
        grossProfit,
        profitMargin
      };
    });

    // Filter by search
    const filtered = list.filter((item) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.product.name.toLowerCase().includes(q) ||
        item.product.category.toLowerCase().includes(q)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (productSortKey === 'profit') {
        valA = a.grossProfit;
        valB = b.grossProfit;
      } else if (productSortKey === 'revenue') {
        valA = a.revenue;
        valB = b.revenue;
      } else if (productSortKey === 'units') {
        valA = a.unitsSold;
        valB = b.unitsSold;
      } else if (productSortKey === 'margin') {
        valA = a.profitMargin;
        valB = b.profitMargin;
      }

      return productSortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return filtered;
  }, [products, filteredOrders, searchTerm, productSortKey, productSortOrder]);

  // Order-by-Order Profit Breakdown
  const orderProfitList = useMemo(() => {
    return filteredOrders
      .map((order) => {
        let orderItemsRevenue = 0;
        let orderItemsCost = 0;

        order.items.forEach((item) => {
          const qty = item.quantity || 1;
          const price = item.price || 0;
          const matchedProd = products.find((p) => p.id === item.productId);
          const cost = item.costPrice ?? matchedProd?.costPrice ?? Math.round(price * 0.62);

          orderItemsRevenue += price * qty;
          orderItemsCost += cost * qty;
        });

        const profit = orderItemsRevenue - orderItemsCost;
        const margin = orderItemsRevenue > 0 ? (profit / orderItemsRevenue) * 100 : 0;

        return {
          order,
          revenue: orderItemsRevenue,
          cost: orderItemsCost,
          profit,
          margin
        };
      })
      .filter((item) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          item.order.id.toLowerCase().includes(q) ||
          item.order.customerName.toLowerCase().includes(q) ||
          item.order.customerPhone.includes(q)
        );
      });
  }, [filteredOrders, products, searchTerm]);

  // Export CSV Function (UTF-8 BOM for Excel compatibility)
  const handleExportCSV = () => {
    const bom = '\uFEFF';
    let csvContent = '';

    if (viewMode === 'products') {
      csvContent += 'ລະຫັດສິນຄ້າ,ຊື່ສິນຄ້າ,ໝວດໝູ່,ລາຄາຕົ້ນທຶນ(ກີບ),ລາຄາຂາຍ(ກີບ),ກຳໄລຕໍ່ຊິ້ນ(ກີບ),ອັດຕາກຳໄລ(%),ຂາຍໄດ້(ຊິ້ນ),ຍອດຂາຍລວມ(ກີບ),ຕົ້ນທຶນລວມ(ກີບ),ກຳໄລລວມ(ກີບ),ສະຕັອກຄົງເຫຼືອ\n';
      productProfitList.forEach((item) => {
        const unitCost = item.product.costPrice ?? Math.round(item.product.price * 0.62);
        const unitProfit = item.product.price - unitCost;
        const unitMargin = item.product.price > 0 ? ((unitProfit / item.product.price) * 100).toFixed(1) : '0';

        csvContent += `"${item.product.id}","${item.product.name.replace(/"/g, '""')}","${item.product.category}",${unitCost},${item.product.price},${unitProfit},${unitMargin}%,${item.unitsSold},${item.revenue},${item.cost},${item.grossProfit},${item.product.stock}\n`;
      });
    } else {
      csvContent += 'ລະຫັດອໍເດີ,ວັນທີ,ຊື່ລູກຄ້າ,ເບີໂທ,ສະຖານະ,ຍອດຂາຍສິນຄ້າ(ກີບ),ຄ່າສົ່ງ(ກີບ),ຍອດລວມທັງໝົດ(ກີບ),ຕົ້ນທຶນສິນຄ້າ(ກີບ),ກຳໄລສຸດທິ(ກີບ),ອັດຕາກຳໄລ(%)\n';
      orderProfitList.forEach((entry) => {
        csvContent += `"${entry.order.id}","${entry.order.createdAt}","${entry.order.customerName.replace(/"/g, '""')}","${entry.order.customerPhone}","${entry.order.status}",${entry.revenue},${entry.order.shippingFee},${entry.order.total},${entry.cost},${entry.profit},${entry.margin.toFixed(1)}%\n`;
      });
    }

    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `NY-Beauty-Profit-Report-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Profit Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn print:m-0 print:p-0">
      {/* Top Controls & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-black text-neutral-900">
              ລາຍງານຜົນກຳໄລ & ຕົ້ນທຶນ (Profit & Loss Report)
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            ວິເຄາະຕົ້ນທຶນສິນຄ້າ, ລາຍຮັບຕົວຈິງ, ກຳໄລຂັ້ນຕົ້ນ ແລະ ມູນຄ່າສະຕັອກສິນຄ້າ
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="flex items-center bg-pink-50/70 p-1 rounded-2xl border border-pink-100 text-xs">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                timeRange === 'all'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-neutral-600 hover:text-pink-600'
              }`}
            >
              ທັງໝົດ
            </button>
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                timeRange === 'today'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-neutral-600 hover:text-pink-600'
              }`}
            >
              ມື້ນີ້
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                timeRange === '7days'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-neutral-600 hover:text-pink-600'
              }`}
            >
              7 ວັນຜ່ານມາ
            </button>
            <button
              onClick={() => setTimeRange('this_month')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                timeRange === 'this_month'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-neutral-600 hover:text-pink-600'
              }`}
            >
              ເດືອນນີ້
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 text-xs rounded-xl border border-pink-200 bg-white font-semibold text-neutral-700 focus:border-pink-500 outline-hidden"
          >
            <option value="paid_only">ສະເພາະອໍເດີ້ທີ່ຊຳລະແລ້ວ</option>
            <option value="all">ທຸກອໍເດີ້ (ລວມລໍຖ້າຊຳລະ)</option>
          </select>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-xs transition-colors cursor-pointer"
            title="ພິມລາຍງານ"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ພິມລາຍງານ</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            title="ດາວໂຫລດ Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">
              ຍອດຂາຍສິນຄ້າລວມ (Gross Sales)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {formatLAK(financialSummary.totalRevenue)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>ຈາກ {financialSummary.orderCount} ອໍເດີ້</span>
            <span>ຂາຍໄດ້ {financialSummary.totalUnitsSold} ຊິ້ນ</span>
          </div>
        </div>

        {/* 2. Total Cost of Goods Sold (COGS) */}
        <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">
              ຕົ້ນທຶນສິນຄ້າລວມ (Total Cost / COGS)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {formatLAK(financialSummary.totalCost)}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">
            ຕົ້ນທຶນຕົວຈິງຂອງສິນຄ້າທີ່ຂາຍອອກ
          </div>
        </div>

        {/* 3. Gross Profit */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-5 rounded-3xl border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">
              ກຳໄລຂັ້ນຕົ້ນ (Gross Profit)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight">
            {formatLAK(financialSummary.grossProfit)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
            <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
              +{financialSummary.profitMargin.toFixed(1)}% ອັດຕາກຳໄລ
            </span>
            <span className="text-emerald-600 font-normal">ຍອດຂາຍ - ຕົ້ນທຶນ</span>
          </div>
        </div>

        {/* 4. Profit Margin Ratio */}
        <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500">
              ອັດຕາກຳໄລສະເລ່ຍ (Profit Margin)
            </span>
            <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 tracking-tight">
            {financialSummary.profitMargin.toFixed(1)}%
          </div>
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, financialSummary.profitMargin))}%` }}
            />
          </div>
        </div>
      </div>

      {/* INVENTORY VALUATION CARDS (Current Stock Worth) */}
      <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-pink-100">
          <Layers className="w-4 h-4 text-pink-600" />
          <h3 className="font-extrabold text-sm text-neutral-900">
            ມູນຄ່າສິນຄ້າຄົງເຫຼືອໃນສາງ (Real-Time Inventory Asset Valuation)
          </h3>
          <span className="text-xs text-neutral-400 ml-auto">
            ທັງໝົດ {products.length} ລາຍການ | {inventoryValuation.totalStockUnits} ຊິ້ນ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
            <span className="text-xs text-neutral-500 font-semibold">
              ມູນຄ່າຕົ້ນທຶນສິນຄ້າໃນສາງ (Total Stock Cost)
            </span>
            <div className="text-xl font-black text-neutral-800">
              {formatLAK(inventoryValuation.totalStockCost)}
            </div>
            <p className="text-[11px] text-neutral-400">
              ເງິນທຶນທີ່ຈົມຢູ່ໃນສິນຄ້າປະຈຸບັນ
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1">
            <span className="text-xs text-neutral-500 font-semibold">
              ມູນຄ່າຂາຍທີ່ຄາດການ (Potential Retail Value)
            </span>
            <div className="text-xl font-black text-neutral-800">
              {formatLAK(inventoryValuation.totalStockRetail)}
            </div>
            <p className="text-[11px] text-neutral-400">
              ຫາກຂາຍສິນຄ້າໃນສາງໝົດທຸກຊິ້ນ
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
            <span className="text-xs text-emerald-800 font-bold">
              ກຳໄລຄາດຄະເນຈາກສາງ (Unrealized Profit)
            </span>
            <div className="text-xl font-black text-emerald-700">
              {formatLAK(inventoryValuation.unrealizedProfit)}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              ອັດຕາກຳໄລຄາດຄະເນ: +{inventoryValuation.expectedMargin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* DETAILED BREAKDOWN SECTION */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-xs overflow-hidden">
        {/* Table Sub-navigation & Search */}
        <div className="p-4 border-b border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-pink-50/20">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('products')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'products'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:text-pink-600 border border-neutral-200'
              }`}
            >
              1. ກຳໄລແຍກຕາມສິນຄ້າ ({productProfitList.length})
            </button>
            <button
              onClick={() => setViewMode('orders')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'orders'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-white text-neutral-600 hover:text-pink-600 border border-neutral-200'
              }`}
            >
              2. ກຳໄລແຍກຕາມອໍເດີ ({orderProfitList.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={viewMode === 'products' ? 'ຄົ້ນຫາຊື່ສິນຄ້າ...' : 'ຄົ້ນຫາເລກອໍເດີ, ຊື່ລູກຄ້າ...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-pink-200 bg-white focus:border-pink-500 outline-hidden font-medium"
            />
          </div>
        </div>

        {/* VIEW 1: PRODUCTS PROFITABILITY TABLE */}
        {viewMode === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pink-50/50 border-b border-pink-100 text-neutral-600 font-bold">
                <tr>
                  <th className="p-4">ສິນຄ້າ & ໝວດໝູ່</th>
                  <th className="p-4">ຕົ້ນທຶນ / ຊິ້ນ</th>
                  <th className="p-4">ລາຄາຂາຍ / ຊິ້ນ</th>
                  <th className="p-4">ກຳໄລຕໍ່ຊິ້ນ (Margin)</th>
                  <th
                    className="p-4 cursor-pointer hover:text-pink-600 select-none"
                    onClick={() => {
                      if (productSortKey === 'units') {
                        setProductSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setProductSortKey('units');
                        setProductSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>ຈຳນວນຂາຍ</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    className="p-4 cursor-pointer hover:text-pink-600 select-none"
                    onClick={() => {
                      if (productSortKey === 'revenue') {
                        setProductSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setProductSortKey('revenue');
                        setProductSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <span>ຍອດຂາຍລວມ</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="p-4">ຕົ້ນທຶນລວມ</th>
                  <th
                    className="p-4 cursor-pointer hover:text-pink-600 select-none"
                    onClick={() => {
                      if (productSortKey === 'profit') {
                        setProductSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                      } else {
                        setProductSortKey('profit');
                        setProductSortOrder('desc');
                      }
                    }}
                  >
                    <div className="flex items-center gap-1 text-emerald-700">
                      <span>ກຳໄລລວມທີ່ໄດ້</span>
                      <ArrowUpDown className="w-3 h-3 text-emerald-600" />
                    </div>
                  </th>
                  <th className="p-4">ສະຕັອກຄົງເຫຼືອ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {productProfitList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-neutral-400">
                      ບໍ່ພົບຂໍ້ມູນກຳໄລສິນຄ້າຕາມເງື່ອນໄຂທີ່ເລືອກ
                    </td>
                  </tr>
                ) : (
                  productProfitList.map((item) => {
                    const unitCost = item.product.costPrice ?? Math.round(item.product.price * 0.62);
                    const unitProfit = item.product.price - unitCost;
                    const unitMargin = item.product.price > 0 ? (unitProfit / item.product.price) * 100 : 0;

                    return (
                      <tr key={item.product.id} className="hover:bg-pink-50/20 transition-colors">
                        {/* Product Info */}
                        <td className="p-4 max-w-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product.images[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'}
                              alt={item.product.name}
                              className="w-10 h-10 rounded-xl object-cover border border-pink-100 bg-pink-50 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-neutral-900 line-clamp-1">
                                {item.product.name}
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-200">
                                {item.product.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Unit Cost */}
                        <td className="p-4 font-mono font-semibold text-neutral-600">
                          {formatLAK(unitCost)}
                        </td>

                        {/* Unit Price */}
                        <td className="p-4 font-mono font-bold text-pink-600">
                          {formatLAK(item.product.price)}
                        </td>

                        {/* Unit Profit & Margin */}
                        <td className="p-4">
                          <div className="font-mono font-bold text-emerald-700">
                            +{formatLAK(unitProfit)}
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                              unitMargin >= 35
                                ? 'bg-emerald-100 text-emerald-800'
                                : unitMargin >= 20
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {unitMargin.toFixed(1)}%
                          </span>
                        </td>

                        {/* Units Sold */}
                        <td className="p-4 font-bold text-neutral-800">
                          {item.unitsSold} ຊິ້ນ
                        </td>

                        {/* Total Revenue */}
                        <td className="p-4 font-mono font-bold text-neutral-900">
                          {formatLAK(item.revenue)}
                        </td>

                        {/* Total Cost */}
                        <td className="p-4 font-mono text-neutral-600">
                          {formatLAK(item.cost)}
                        </td>

                        {/* Total Gross Profit */}
                        <td className="p-4">
                          <div className="font-mono font-black text-emerald-700 text-sm">
                            +{formatLAK(item.grossProfit)}
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {item.profitMargin.toFixed(1)}% ຂອງຍອດຂາຍ
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-lg font-mono font-bold text-[11px] ${
                              item.product.stock <= 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {item.product.stock} ຊິ້ນ
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: ORDERS PROFITABILITY TABLE */}
        {viewMode === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pink-50/50 border-b border-pink-100 text-neutral-600 font-bold">
                <tr>
                  <th className="p-4">ເລກອໍເດີ & ວັນທີ</th>
                  <th className="p-4">ລູກຄ້າ & ເບີໂທ</th>
                  <th className="p-4">ສະຖານະ</th>
                  <th className="p-4">ຍອດຂາຍສິນຄ້າ</th>
                  <th className="p-4">ຕົ້ນທຶນສິນຄ້າ</th>
                  <th className="p-4 text-emerald-800">ກຳໄລສຸດທິ</th>
                  <th className="p-4">ອັດຕາກຳໄລ (%)</th>
                  <th className="p-4 text-center">ກວດສອບ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orderProfitList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral-400">
                      ບໍ່ພົບອໍເດີຕາມເງື່ອນໄຂທີ່ເລືອກ
                    </td>
                  </tr>
                ) : (
                  orderProfitList.map(({ order, revenue, cost, profit, margin }) => (
                    <tr key={order.id} className="hover:bg-pink-50/20 transition-colors">
                      {/* Order ID & Date */}
                      <td className="p-4">
                        <div className="font-mono font-extrabold text-neutral-900">
                          #{order.id}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {order.createdAt}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-bold text-neutral-900">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {order.customerPhone}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            order.status === 'completed' || order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'paid' || order.status === 'packing'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status === 'completed'
                            ? 'ສຳເລັດ'
                            : order.status === 'shipped'
                            ? 'ຈັດສົ່ງແລ້ວ'
                            : order.status === 'packing'
                            ? 'ກຳລັງແພັກ'
                            : order.status === 'paid'
                            ? 'ຊຳລະແລ້ວ'
                            : 'ລໍຖ້າຊຳລະ'}
                        </span>
                      </td>

                      {/* Revenue */}
                      <td className="p-4 font-mono font-bold text-neutral-900">
                        {formatLAK(revenue)}
                      </td>

                      {/* Cost */}
                      <td className="p-4 font-mono text-neutral-600">
                        {formatLAK(cost)}
                      </td>

                      {/* Profit */}
                      <td className="p-4 font-mono font-black text-emerald-700 text-sm">
                        +{formatLAK(profit)}
                      </td>

                      {/* Margin */}
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            margin >= 35
                              ? 'bg-emerald-100 text-emerald-800'
                              : margin >= 20
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      </td>

                      {/* Inspect Action */}
                      <td className="p-4 text-center">
                        {onInspectOrder && (
                          <button
                            onClick={() => onInspectOrder(order.id)}
                            className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 transition-colors cursor-pointer"
                            title="ກວດສອບອໍເດີ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRINT-ONLY OFFICIAL REPORT HEADER & SIGNATURE (Shows only when printing) */}
      <div className="hidden print:block p-8 border-t-2 border-neutral-300 mt-8 space-y-6 text-neutral-800">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black">{storeSettings.storeName || 'NY Beauty SHop'}</h1>
          <p className="text-sm font-semibold">ລາຍງານຜົນກຳໄລ & ຕົ້ນທຶນສິນຄ້າ (Profit & Loss Statement)</p>
          <p className="text-xs text-neutral-500">
            ວັນທີພິມລາຍງານ: {new Date().toLocaleDateString('lo-LA')} | ເບີໂທ: {storeSettings.storePhone}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 bg-neutral-100 rounded-xl text-xs font-bold">
          <div>ຍອດຂາຍລວມ: {formatLAK(financialSummary.totalRevenue)}</div>
          <div>ຕົ້ນທຶນລວມ: {formatLAK(financialSummary.totalCost)}</div>
          <div>ກຳໄລຂັ້ນຕົ້ນ: {formatLAK(financialSummary.grossProfit)}</div>
          <div>ອັດຕາກຳໄລ: {financialSummary.profitMargin.toFixed(1)}%</div>
        </div>

        <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-neutral-400 w-48 mx-auto mb-2" />
            <p className="font-bold">ຜູ້ຈັດທຳລາຍງານ (Prepared By)</p>
          </div>
          <div>
            <div className="border-b border-neutral-400 w-48 mx-auto mb-2" />
            <p className="font-bold">ເຈົ້າຂອງຮ້ານ / ຜູ້ກວດສອບ (Approved By)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
