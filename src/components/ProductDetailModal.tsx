import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Zap,
  Check,
  AlertCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product } from '../types';
import { formatLAK } from '../utils/format';
import { useStore } from '../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, selectedOptions: Record<string, string>, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow
}) => {
  const { addToCart } = useStore();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0] || '');
      // Initialize default selections for each option
      const initial: Record<string, string> = {};
      if (product.options && product.options.length > 0) {
        product.options.forEach((opt) => {
          if (opt.values.length > 0) {
            initial[opt.name] = opt.values[0];
          }
        });
      }
      setSelectedOptions(initial);
      setQuantity(1);
      setFeedbackMsg(null);
    }
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value
    }));
  };

  const handleAddToCart = () => {
    const res = addToCart(product, selectedOptions, quantity);
    if (res.success) {
      setFeedbackMsg('ເພີ່ມສິນຄ້າໃສ່ກະຕ່າຮຽບຮ້ອຍແລ້ວ! 🌸');
      setTimeout(() => setFeedbackMsg(null), 2500);
    } else {
      setFeedbackMsg(res.message || 'ບໍ່ສາມາດເພີ່ມໄດ້');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, selectedOptions, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        id="product-detail-modal"
        className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-pink-100 flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-neutral-800 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Image Gallery */}
        <div className="w-full md:w-1/2 bg-pink-50/40 p-6 flex flex-col justify-between">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-xs border border-pink-100 flex items-center justify-center group">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {discountPercent && (
              <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                ໂປຣໂມຊັ່ນ ຫຼຸດ {discountPercent}%
              </span>
            )}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = product.images.indexOf(selectedImage || product.images[0]);
                    const prevIdx = (currentIdx - 1 + product.images.length) % product.images.length;
                    setSelectedImage(product.images[prevIdx]);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-700 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100 hover:scale-105"
                  title="ຮູບກ່ອນໜ້າ"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIdx = product.images.indexOf(selectedImage || product.images[0]);
                    const nextIdx = (currentIdx + 1) % product.images.length;
                    setSelectedImage(product.images[nextIdx]);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-700 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-90 hover:opacity-100 hover:scale-105"
                  title="ຮູບຖັດໄປ"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-neutral-900/60 backdrop-blur-xs text-white text-[10px] font-medium">
                  {Math.max(1, product.images.indexOf(selectedImage || product.images[0]) + 1)} / {product.images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImage === img
                      ? 'border-pink-500 ring-2 ring-pink-200'
                      : 'border-pink-100 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="mt-4 pt-3 border-t border-pink-100/80 grid grid-cols-2 gap-2 text-[11px] text-neutral-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ສິນຄ້າແທ້ 100% ຮັບປະກັນ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-pink-500 shrink-0" />
              <span>Anusith, Hal, Mixay</span>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Order Options */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category & Stock Indicator */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-pink-600 font-medium px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200">
                {product.category}
              </span>

              {isOutOfStock ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  ສິນຄ້າໝົດສະຕັອກ
                </span>
              ) : isLowStock ? (
                <span className="text-amber-600 font-medium flex items-center gap-1 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  ໃກ້ໝົດແລ້ວ! ເຫຼືອພຽງ {product.stock} ຊິ້ນ
                </span>
              ) : (
                <span className="text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5" />
                  ພ້ອມສົ່ງ (ເຫຼືອ {product.stock} ຊິ້ນ)
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
              {product.name}
            </h1>

            {/* Pricing (LAK Kip) */}
            <div className="p-3.5 bg-pink-50/60 rounded-2xl border border-pink-100 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-pink-600">
                {formatLAK(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-neutral-400 line-through">
                  {formatLAK(product.originalPrice)}
                </span>
              )}
              <span className="text-xs text-pink-500 font-medium ml-auto">
                ກີບລາວ (LAK)
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                ລາຍລະອຽດສິນຄ້າ
              </h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Variants / Options (ປະລິມານ, ຂະໜາດ, ສີ) */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-pink-100">
                {product.options.map((opt, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      ເລືອກ{opt.name}:
                      <span className="text-pink-600 ml-1 font-bold">
                        {selectedOptions[opt.name]}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const isSelected = selectedOptions[opt.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleOptionSelect(opt.name, val)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-pink-500 text-white border-pink-500 shadow-xs ring-2 ring-pink-200'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:border-pink-300'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="pt-2 border-t border-pink-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700">
                ຈຳນວນ:
              </span>
              <div className="flex items-center gap-3 bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white text-neutral-700 font-bold flex items-center justify-center hover:bg-pink-50 disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-neutral-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-lg bg-white text-neutral-700 font-bold flex items-center justify-center hover:bg-pink-50 disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Toast Feedback */}
            {feedbackMsg && (
              <div className="p-2.5 rounded-xl bg-pink-100/90 text-pink-800 text-xs font-semibold text-center animate-fadeIn">
                {feedbackMsg}
              </div>
            )}
          </div>

          {/* Action Buttons: ໃສ່ກະຕ່າ & ຊື້ເລີຍ */}
          <div className="pt-5 mt-4 border-t border-pink-100 grid grid-cols-2 gap-3">
            <button
              id="modal-add-to-cart-btn"
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="w-full py-3 px-4 rounded-2xl font-semibold text-sm border-2 border-pink-500 text-pink-600 hover:bg-pink-50 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ໃສ່ກະຕ່າ</span>
            </button>

            <button
              id="modal-buy-now-btn"
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNowClick}
              className="w-full py-3 px-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-200 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              <span>ຊື້ເລີຍ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
