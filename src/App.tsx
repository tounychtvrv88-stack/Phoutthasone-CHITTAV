import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { CatalogView } from './components/CatalogView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { TrackingModal } from './components/TrackingModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Footer } from './components/Footer';
import { Product, CartItem } from './types';
import { Facebook, Monitor, Smartphone } from 'lucide-react';

// Helper to determine if the URL is requesting the separate Admin back-office route
const checkIsAdminRoute = () => {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  return (
    hash === '#admin' ||
    hash.startsWith('#admin') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin') ||
    params.get('view') === 'admin' ||
    params.has('admin')
  );
};

function NyStoreApp() {
  const { isAdminAuthenticated, storeSettings, viewMode, setViewMode, toggleViewMode } = useStore();
  const [currentView, setCurrentView] = useState<'shop' | 'admin'>(() => {
    return checkIsAdminRoute() ? 'admin' : 'shop';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [directBuyItem, setDirectBuyItem] = useState<CartItem | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Sync state with URL hash and popstate for back/forward navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const shouldBeAdmin = checkIsAdminRoute();
      setCurrentView(shouldBeAdmin ? 'admin' : 'shop');
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Update URL whenever view is navigated
  const switchView = (view: 'shop' | 'admin') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        if (window.location.hash !== '#admin') {
          window.history.pushState({ view: 'admin' }, '', '#admin');
        }
      } else {
        if (window.location.hash === '#admin') {
          window.history.pushState(
            { view: 'shop' },
            '',
            window.location.pathname + window.location.search
          );
        }
      }
    }
  };

  // Handle request to access Admin Back-office
  const handleRequestAdmin = () => {
    if (isAdminAuthenticated) {
      switchView('admin');
    } else {
      switchView('admin');
    }
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsAdminLoginOpen(false);
    switchView('admin');
  };

  // Handle "Buy Now" (ຊື້ເລີຍ) from product detail modal
  const handleBuyNow = (
    product: Product,
    selectedOptions: Record<string, string>,
    quantity: number
  ) => {
    const buyItem: CartItem = {
      id: `direct-${Date.now()}`,
      productId: product.id,
      product,
      selectedOptions,
      quantity,
      price: product.price
    };
    setDirectBuyItem(buyItem);
    setSelectedProduct(null); // Close detail modal
    setIsCheckoutOpen(true);   // Open checkout immediately
  };

  // Open checkout from cart drawer
  const handleProceedToCheckoutFromCart = () => {
    setDirectBuyItem(null); // Use cart items
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Open Tracking modal
  const handleOpenTracking = (orderId?: string) => {
    setTrackingOrderId(orderId);
    setIsTrackingOpen(true);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#FFF5F7] text-neutral-800 ${viewMode === 'desktop' ? 'min-w-[1200px]' : ''}`}>
      {/* Top Banner when in Desktop Mode */}
      {viewMode === 'desktop' && (
        <aside aria-label="ແຈ້ງເຕືອນໂໝດສະແດງຜົນແບບຄອມ" className="bg-neutral-900 text-white text-xs py-2 px-4 flex items-center justify-between border-b border-neutral-800 shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="font-medium text-[11px] sm:text-xs">
              🖥️ <strong>ໂໝດຄອມພິວເຕີ (Desktop View Mode)</strong>: ກຳລັງສະແດງຜົນເຕັມຈໍແບບຄອມ (ສາມາດຊູມເຂົ້າ-ອອກໄດ້)
            </span>
          </div>
          <button
            onClick={() => setViewMode('mobile')}
            className="px-3 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded-full text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>ປ່ຽນເປັນໂໝດມືຖື</span>
          </button>
        </aside>
      )}

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracking={() => handleOpenTracking()}
        currentView={currentView}
        setCurrentView={switchView}
        onRequestAdmin={handleRequestAdmin}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'shop' ? (
          <CatalogView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onOpenTracking={() => handleOpenTracking()}
            onOpenCart={() => setIsCartOpen(true)}
          />
        ) : (
          <AdminDashboard
            onReturnToShop={() => switchView('shop')}
            onOpenLogin={() => setIsAdminLoginOpen(true)}
            onViewProductInShop={(product) => {
              switchView('shop');
              setSelectedProduct(product);
              setTimeout(() => {
                const el = document.getElementById(`product-card-${product.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 200);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenTracking={() => handleOpenTracking()}
      />

      {/* Floating Bottom-Left View Mode Toggle (ປຸ່ມສະຫຼັບໂໝດຄອມ/ມືຖື ລຸ່ມຊ້າຍມື) */}
      <aside aria-label="ສະຫຼັບໂໝດສະແດງຜົນ" className="fixed bottom-6 left-6 z-40">
        <button
          id="floating-viewmode-toggle-btn"
          onClick={toggleViewMode}
          className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-neutral-800 rounded-full shadow-xl shadow-pink-200/60 hover:shadow-pink-300/80 border border-pink-200 hover:border-pink-300 active:scale-95 transition-all font-bold text-xs cursor-pointer select-none"
          title={
            viewMode === 'desktop'
              ? 'ກຳລັງສະແດງຜົນແບບຄອມ (ກົດເພື່ອປ່ຽນເປັນໂໝດມືຖື)'
              : 'ກຳລັງສະແດງຜົນແບບມືຖື (ກົດເພື່ອເບິ່ງເວັບໄຊຄືຄອມ)'
          }
        >
          {viewMode === 'desktop' ? (
            <>
              <div className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="text-neutral-700 font-semibold text-[11px] sm:text-xs">ໂໝດມືຖື</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xs">
                <Monitor className="w-3.5 h-3.5" />
              </div>
              <span className="text-pink-700 font-bold text-[11px] sm:text-xs">ເບິ່ງແບບຄອມ</span>
            </>
          )}
        </button>
      </aside>

      {/* Floating Bottom-Right Facebook Contact Button (ປຸ່ມ Facebook ລຸ່ມຂວາມື ປຸ່ມດ່ຽວ) */}
      {currentView === 'shop' && (
        <aside aria-label="ຕິດຕໍ່ຮ້ານຄ້າຜ່ານ Facebook" className="fixed bottom-6 right-6 z-40">
          <a
            id="floating-facebook-contact-btn"
            href={storeSettings.facebookUrl || 'https://www.facebook.com/share/1B59iN8jJG/?mibextid=wwXIfr'}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-4 sm:px-5 py-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-full shadow-2xl shadow-blue-600/40 hover:shadow-blue-600/60 hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-xs sm:text-sm border-2 border-white cursor-pointer select-none"
            title={`ຕິດຕໍ່ຮ້ານຄ້າຜ່ານ Facebook: ${storeSettings.facebookPageName || 'NY Beauty SHop'}`}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white"></span>
            </span>
            <Facebook className="w-5 h-5 fill-white text-white shrink-0 group-hover:rotate-6 transition-transform" />
            <span className="whitespace-nowrap tracking-wide">ຕິດຕໍ່ຮ້ານຄ້າ</span>
          </a>
        </aside>
      )}

      {/* Modals & Drawers */}
      {/* 0. Admin Login Security Gate Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* 1. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onBuyNow={handleBuyNow}
      />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckoutFromCart}
      />

      {/* 3. Checkout Modal with BCEL OnePay */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectBuyItem(null);
        }}
        directBuyItem={directBuyItem}
        onOpenTracking={(id) => handleOpenTracking(id)}
      />

      {/* 4. Tracking Modal */}
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => {
          setIsTrackingOpen(false);
          setTrackingOrderId(undefined);
        }}
        initialOrderId={trackingOrderId}
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <NyStoreApp />
    </StoreProvider>
  );
}
