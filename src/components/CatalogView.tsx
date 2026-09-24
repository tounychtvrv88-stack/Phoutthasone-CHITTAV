import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle,
  Search,
  MessageCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { formatLAK } from '../utils/format';
import { NyStoreLogo } from './NyStoreLogo';

interface CatalogViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenTracking: () => void;
  onOpenCart: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  searchQuery,
  setSearchQuery,
  onSelectProduct,
  onOpenTracking,
  onOpenCart
}) => {
  const { products, addToCart, storeSettings, categories } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('ທັງໝົດ');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'sales'>('featured');
  const [quickToast, setQuickToast] = useState<string | null>(null);

  const displayCategories = ['ທັງໝົດ', ...categories];

  // Filter & Sort
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ທັງໝົດ' || p.category === selectedCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'sales') return (b.salesCount || 0) - (a.salesCount || 0);
    return 0; // featured default
  });

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // Use first available options if any
    const defaultOptions: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      product.options.forEach((opt) => {
        if (opt.values.length > 0) defaultOptions[opt.name] = opt.values[0];
      });
    }

    const res = addToCart(product, defaultOptions, 1);
    if (res.success) {
      setQuickToast(`ເພີ່ມ "${product.name}" ໃສ່ກະຕ່າແລ້ວ! 🌸`);
      setTimeout(() => setQuickToast(null), 2500);
    } else {
      setQuickToast(res.message || 'ບໍ່ສາມາດເພີ່ມໄດ້');
      setTimeout(() => setQuickToast(null), 2500);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {quickToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slideUp border border-pink-400/40">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{quickToast}</span>
          <button
            onClick={onOpenCart}
            className="ml-2 text-pink-300 hover:text-white underline text-[11px]"
          >
            ເບິ່ງກະຕ່າ
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-200 via-rose-100 to-pink-100 border border-pink-200 shadow-sm p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs text-[11px] font-bold text-pink-700 border border-pink-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>BEAUTY & FASHION OFFICIAL STORE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            ຍິນດີຕ້ອນຮັບສູ່ <br />
            <span className="text-pink-600 drop-shadow-xs">Ny Store</span> ຮ້ານຄ້າອອນລາຍ
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-lg">
            ເລືອກຊື້ສິນຄ້າຄວາມງາມ ແລະ ແຟຊັ່ນຍອດນິຍົມ ຄຸນນະພາບສູງ ພ້ອມຈັດສົ່ງດ່ວນທົ່ວປະເທດລາວ ຊຳລະສະດວກຜ່ານ BCEL One ໄດ້ທັນທີ
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('product-catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-pink-200 transition-all cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ເລືອກຊື້ສິນຄ້າ</span>
            </button>

            <button
              onClick={onOpenTracking}
              className="px-5 py-3 rounded-2xl bg-white/90 hover:bg-white text-pink-700 font-semibold text-xs sm:text-sm border border-pink-200 shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-pink-500" />
              <span>ຕິດຕາມພັດສະດຸ</span>
            </button>
          </div>
        </div>

        {/* Featured Brand Logo Card (visible with adaptive sizing on both mobile & desktop) */}
        <div className="relative z-10 shrink-0 flex justify-center w-full md:w-auto">
          <NyStoreLogo variant="card" className="w-52 sm:w-64 bg-white/95 backdrop-blur-md shadow-xl" />
        </div>

        {/* Decorative subtle circles */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-pink-300/30 blur-2xl pointer-events-none"></div>
        <div className="absolute right-20 top-4 w-44 h-44 rounded-full bg-rose-200/40 blur-xl pointer-events-none"></div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="product-catalog-section" className="space-y-6">
        {/* Controls Bar: Categories & Sort Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-pink-100">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-1">
            {displayCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-200 ring-2 ring-pink-200'
                    : 'bg-white text-neutral-600 hover:text-pink-600 border border-pink-100 hover:border-pink-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">ຮຽງຕາມ:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white text-xs text-neutral-700 font-semibold px-3 py-1.5 sm:py-2 rounded-full border border-pink-200 hover:border-pink-300 focus:outline-hidden focus:ring-2 focus:ring-pink-200 shadow-2xs cursor-pointer"
            >
              <option value="featured">✨ ສິນຄ້າແນະນຳ</option>
              <option value="sales">🔥 ຂາຍດີທີ່ສຸດ</option>
              <option value="price_asc">💵 ລາຄາ: ຕ່ຳຫາສູງ</option>
              <option value="price_desc">💎 ລາຄາ: ສູງຫາຕ່ຳ</option>
            </select>
          </div>
        </div>

        {/* Search Results Summary if searching */}
        {searchQuery && (
          <div className="flex items-center justify-between text-xs text-neutral-500 bg-pink-50/70 p-3 rounded-xl border border-pink-100">
            <span>
              ຜົນການຄົ້ນຫາສຳລັບ: <strong className="text-pink-600 font-bold">"{searchQuery}"</strong> ({sortedProducts.length} ລາຍການ)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-pink-600 underline hover:text-pink-800"
            >
              ລຶບການຄົ້ນຫາ
            </button>
          </div>
        )}

        {/* Product Grid (ຕາຕະລາງລາຍການສິນຄ້າ) */}
        {sortedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-pink-100 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto text-pink-300">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-700">
              ບໍ່ພົບສິນຄ້າໃນໝວດໝູ່ນີ້
            </h3>
            <p className="text-xs text-neutral-400">
              ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເລືອກໝວດໝູ່ອື່ນ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickAdd={handleQuickAdd}
              />
            ))}
          </div>
        )}
      </section>

      {/* Customer Assurance Footer Banner */}
      <section className="rounded-3xl bg-pink-50/80 border border-pink-200 p-6 text-center space-y-3">
        <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg">
          ມີຄຳຖາມ ຫຼື ຕ້ອງການສັ່ງຊື້ພິເສດ?
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          ຕິດຕໍ່ພວກເຮົາຜ່ານ Facebook ຫຼື WhatsApp ໄດ້ຕະຫຼອດ ພ້ອມໃຫ້ຄຳປຶກສາ ແລະ ດູແລທ່ານດ້ວຍຄວາມເຕັມໃຈ 🌸
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <a
            id="catalog-whatsapp-btn"
            href={`https://wa.me/${storeSettings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
              'ສະບາຍດີ NY Beauty SHop ຕ້ອງການສອບຖາມຂໍ້ມູນສິນຄ້າເພີ່ມເຕີມ'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md shadow-emerald-200 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp: {storeSettings.storePhone}</span>
          </a>
        </div>
      </section>
    </div>
  );
};
