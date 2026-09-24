import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatLAK } from '../utils/format';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const { cart, updateCartQuantity, removeFromCart, cartSubtotal, cartTotalCount } = useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        id="cart-drawer-panel"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-pink-100 animate-slideLeft"
      >
        {/* Header */}
        <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-pink-50/40">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-pink-500 text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-neutral-900 leading-tight">
                ກະຕ່າສິນຄ້າ (ລາຍການຊື້)
              </h2>
              <p className="text-xs text-neutral-500">
                {cartTotalCount > 0 ? `ທັງໝົດ ${cartTotalCount} ລາຍການ` : 'ຍັງບໍ່ມີສິນຄ້າ'}
              </p>
            </div>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pink-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-neutral-400">
              <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center text-pink-300">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-700 text-base">ກະຕ່າຂອງທ່ານຍັງວ່າງເປົ່າ</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  ກະລຸນາເລືອກຊື້ສິນຄ້າທີ່ທ່ານມັກ ແລະ ເພີ່ມໃສ່ກະຕ່າໄດ້ເລີຍ!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-medium text-xs rounded-full shadow-md shadow-pink-200 transition-all cursor-pointer"
              >
                ໄປເລືອກຊື້ສິນຄ້າ
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const optionsSummary = Object.entries(item.selectedOptions)
                .map(([k, v]) => `${k}: ${v}`)
                .join(' • ');

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-pink-100 hover:border-pink-200 shadow-xs flex gap-3 items-center"
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-pink-50 shrink-0 border border-pink-100">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-neutral-800 line-clamp-1">
                      {item.product.name}
                    </h4>
                    {optionsSummary && (
                      <p className="text-[11px] text-pink-600 font-medium truncate mt-0.5">
                        {optionsSummary}
                      </p>
                    )}
                    <div className="text-xs font-bold text-pink-600 mt-1">
                      {formatLAK(item.price)}
                    </div>
                  </div>

                  {/* Qty & Delete */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                      title="ລຶບລາຍການນີ້"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-100">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-neutral-700 hover:text-pink-600 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        disabled={item.quantity >= item.product.stock}
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-neutral-700 hover:text-pink-600 cursor-pointer disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-pink-100 bg-white space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>ຍອດລວມສິນຄ້າ:</span>
                <span className="font-semibold text-neutral-900">{formatLAK(cartSubtotal)}</span>
              </div>
              <div className="pt-2 border-t border-pink-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-neutral-900">ຍອດຈຳນວນເງິນທັງໝົດ:</span>
                <span className="text-lg font-black text-pink-600">{formatLAK(cartSubtotal)}</span>
              </div>
            </div>

            <button
              id="proceed-to-checkout-btn"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-200 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ຊຳລະເງິນ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
