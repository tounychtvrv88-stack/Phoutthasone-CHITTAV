import React from 'react';
import {
  ShoppingBag,
  Search,
  Truck,
  Sparkles,
  Store,
  LogOut,
  Monitor,
  Smartphone
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatLAK } from '../utils/format';
import { NyStoreLogo } from './NyStoreLogo';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  currentView: 'shop' | 'admin';
  setCurrentView: (view: 'shop' | 'admin') => void;
  onRequestAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenCart,
  onOpenTracking,
  currentView,
  setCurrentView
}) => {
  const {
    cartTotalCount,
    cartSubtotal,
    storeSettings,
    logoutAdmin,
    viewMode,
    toggleViewMode
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Store Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="brand-logo-btn"
              onClick={() => setCurrentView('shop')}
              className="group text-left cursor-pointer transition-transform hover:opacity-95"
              title="ກັບໄປໜ້າຫຼັກ Ny Store"
            >
              <NyStoreLogo variant="horizontal" size="md" />
            </button>
          </div>

          {/* Search Bar (Only visible or prominent in shop mode) */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                id="search-input-desktop"
                type="text"
                placeholder="ຄົ້ນຫາສິນຄ້າ, ໝວດໝູ່, ລາຍລະອຽດ..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'shop') setCurrentView('shop');
                }}
                className="w-full bg-pink-50/70 hover:bg-pink-50 focus:bg-white text-sm text-neutral-800 placeholder-pink-400/80 rounded-full pl-11 pr-4 py-2.5 border border-pink-200/80 focus:border-pink-400 focus:ring-3 focus:ring-pink-100 outline-hidden transition-all"
              />
              <Search className="w-4 h-4 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 px-1"
                >
                  ລຶບ
                </button>
              )}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* View Mode Toggle: ໂໝດຄອມພິວເຕີ vs ໂໝດມືຖື */}
            <button
              id="header-toggle-viewmode-btn"
              onClick={toggleViewMode}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-bold rounded-full border transition-all cursor-pointer shadow-2xs group bg-white hover:bg-pink-50 border-pink-200 text-pink-700"
              title={
                viewMode === 'desktop'
                  ? 'ປ່ຽນເປັນໂໝດມືຖື (Switch to Mobile View)'
                  : 'ປ່ຽນເປັນໂໝດຄອມພິວເຕີ (Switch to Desktop/PC View) ເພື່ອເບິ່ງເວັບໄຊເຕັມຮູບແບບ'
              }
            >
              {viewMode === 'desktop' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] sm:text-xs">ໂໝດມືຖື</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] sm:text-xs">ໂໝດຄອມ</span>
                </>
              )}
            </button>

            {/* Tracking Button (ປຸ່ມຕິດຕາມພັດສະດຸ) */}
            <button
              id="track-parcel-btn"
              onClick={onOpenTracking}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-full transition-colors cursor-pointer shadow-xs"
              title="ຕິດຕາມສະຖານະພັດສະດຸ"
            >
              <Truck className="w-4 h-4 text-pink-500 shrink-0" />
              <span className="hidden sm:inline">ຕິດຕາມພັດສະດຸ</span>
            </button>

            {/* Cart Button (ປຸ່ມກະຕ່າ) */}
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full font-medium text-sm shadow-md shadow-pink-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">ກະຕ່າ</span>
              {cartTotalCount > 0 && (
                <span className="bg-white text-pink-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-tight shadow-xs">
                  {cartTotalCount}
                </span>
              )}
              {cartSubtotal > 0 && (
                <span className="hidden lg:inline text-xs font-semibold pl-1 border-l border-pink-300/60">
                  {formatLAK(cartSubtotal)}
                </span>
              )}
            </button>

            {/* Return to Shop & Logout (only shown when currently in admin back-office view) */}
            {currentView === 'admin' && (
              <div className="flex items-center gap-1.5">
                <button
                  id="toggle-backoffice-btn"
                  onClick={() => setCurrentView('shop')}
                  className="relative flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-full border bg-neutral-900 text-white border-neutral-900 shadow-sm transition-all cursor-pointer hover:bg-neutral-800"
                >
                  <Store className="w-4 h-4 text-pink-400" />
                  <span>ກັບໜ້າຮ້ານ</span>
                </button>
                <button
                  id="admin-logout-btn"
                  onClick={() => {
                    logoutAdmin();
                    setCurrentView('shop');
                  }}
                  title="ອອກຈາກລະບົບຜູ້ດູແລ"
                  className="p-2 rounded-full border border-neutral-200 hover:border-rose-300 bg-white hover:bg-rose-50 text-neutral-600 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              id="search-input-mobile"
              type="text"
              placeholder="ຄົ້ນຫາສິນຄ້າ..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'shop') setCurrentView('shop');
              }}
              className="w-full bg-pink-50/70 text-sm text-neutral-800 placeholder-pink-400/80 rounded-full pl-10 pr-4 py-2 border border-pink-200 outline-hidden"
            />
            <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </header>
  );
};
