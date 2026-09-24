import React from 'react';
import { ShoppingBag, Eye, Sparkles, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';
import { formatLAK } from '../utils/format';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect(product)}
      className="group bg-white rounded-2xl border border-pink-100 shadow-xs hover:shadow-xl hover:shadow-pink-100/50 hover:border-pink-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discountPercent && (
          <span className="bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            ຫຼຸດ {discountPercent}%
          </span>
        )}
        {product.isPromo && (
          <span className="bg-pink-100 text-pink-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-pink-200">
            ໂປຣໂມຊັ່ນ
          </span>
        )}
      </div>

      {/* Stock status badge top right */}
      <div className="absolute top-3 right-3 z-10">
        {isOutOfStock ? (
          <span className="bg-neutral-800 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs">
            ສິນຄ້າໝົດ
          </span>
        ) : isLowStock ? (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 shadow-xs">
            <AlertTriangle className="w-2.5 h-2.5" />
            ເຫຼືອ {product.stock}
          </span>
        ) : null}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-pink-50/50">
        <img
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {/* Hover Quick View overlay */}
        <div className="absolute inset-0 bg-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3.5 py-1.5 bg-white/90 backdrop-blur-xs text-xs font-semibold text-neutral-800 rounded-full shadow-sm flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-pink-600" />
            ເບິ່ງລາຍລະອຽດ
          </span>
        </div>
        {/* Multi-image indicator */}
        {product.images && product.images.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-neutral-900/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 z-10 pointer-events-none">
            <ImageIcon className="w-2.5 h-2.5" />
            <span>{product.images.length}</span>
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category tag */}
          <div className="flex items-center justify-between text-xs text-pink-600 mb-1 font-medium">
            <span>{product.category}</span>
            {product.salesCount > 0 && (
              <span className="text-[11px] text-neutral-400">
                ຂາຍແລ້ວ {product.salesCount} ຊິ້ນ
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm sm:text-base text-neutral-900 line-clamp-2 group-hover:text-pink-600 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Options hints */}
          {product.options && product.options.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {product.options.map((opt, idx) => (
                <span
                  key={idx}
                  className="text-[10px] text-neutral-500 bg-pink-50/80 px-1.5 py-0.5 rounded-sm"
                >
                  {opt.name}: {opt.values.length} ຕົວເລືອກ
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add to cart button */}
        <div className="pt-2 border-t border-pink-50 flex items-end justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-bold text-pink-600">
              {formatLAK(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-neutral-400 line-through">
                {formatLAK(product.originalPrice)}
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            id={`quick-add-btn-${product.id}`}
            disabled={isOutOfStock}
            onClick={(e) => onQuickAdd(product, e)}
            className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isOutOfStock
                ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                : 'bg-pink-50 text-pink-600 hover:bg-pink-500 hover:text-white border border-pink-200 hover:border-pink-500 shadow-xs'
            }`}
            title={isOutOfStock ? 'ສິນຄ້າໝົດ' : 'ໃສ່ກະຕ່າ'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
