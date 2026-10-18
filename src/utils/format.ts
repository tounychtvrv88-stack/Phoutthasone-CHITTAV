import { Order, Product, ShippingProvider } from '../types';

/**
 * Format numbers as Lao Kip currency (₭)
 */
export function formatLAK(amount: number): string {
  return `₭${amount.toLocaleString('en-US')}`;
}

export interface ProductOptionPriceInfo {
  price: number;
  costPrice: number;
  originalPrice?: number;
  stock: number;
  isOutOfStock: boolean;
  hasCustomStock: boolean;
  discountPercent?: number | null;
}

/**
 * Calculate the exact price, costPrice, originalPrice and stock for a product given selected options
 */
export function getProductPriceForOptions(
  product: Product,
  selectedOptions?: Record<string, string> | null
): ProductOptionPriceInfo {
  let price = product.price;
  let costPrice = product.costPrice ?? Math.round(product.price * 0.62);
  let originalPrice = product.originalPrice;
  let stock = product.stock;
  let hasCustomStock = false;

  if (product.options && product.options.length > 0 && selectedOptions) {
    // Iterate over options to see if any selected option value defines an explicit price, originalPrice, or stock
    for (const opt of product.options) {
      const selectedVal = selectedOptions[opt.name];
      if (selectedVal) {
        if (opt.prices && typeof opt.prices[selectedVal] === 'number' && opt.prices[selectedVal] > 0) {
          price = opt.prices[selectedVal];
        }
        if (opt.costPrices && typeof opt.costPrices[selectedVal] === 'number' && opt.costPrices[selectedVal] > 0) {
          costPrice = opt.costPrices[selectedVal];
        }
        if (opt.originalPrices && typeof opt.originalPrices[selectedVal] === 'number' && opt.originalPrices[selectedVal] > 0) {
          originalPrice = opt.originalPrices[selectedVal];
        }
        if (opt.stocks && typeof opt.stocks[selectedVal] === 'number') {
          stock = opt.stocks[selectedVal];
          hasCustomStock = true;
        }
      }
    }
  }

  const isOutOfStock = stock <= 0;
  const discountPercent =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  return {
    price,
    costPrice,
    originalPrice,
    stock,
    isOutOfStock,
    hasCustomStock,
    discountPercent
  };
}

/**
 * Calculate total stock across all option variants or base stock
 */
export function getTotalProductStock(product: Product): number {
  if (product.options && product.options.length > 0) {
    for (const opt of product.options) {
      if (opt.stocks && Object.keys(opt.stocks).length > 0) {
        const sum = Object.values(opt.stocks).reduce(
          (acc, curr) => acc + (typeof curr === 'number' ? curr : 0),
          0
        );
        if (sum > 0 || Object.keys(opt.stocks).length === opt.values.length) {
          return sum;
        }
      }
    }
  }
  return product.stock;
}

/**
 * Determine the min and max price across all option variants of a product
 */
export function getProductPriceRange(product: Product): {
  minPrice: number;
  maxPrice: number;
  hasRange: boolean;
  allPrices: number[];
  maxDiscountPercent?: number | null;
  hasOptionStock: boolean;
  totalOptionStock: number;
} {
  const prices: number[] = [product.price];
  let maxDiscount: number | null = null;
  let hasOptionStock = false;
  let totalOptionStock = 0;

  if (product.originalPrice && product.originalPrice > product.price) {
    maxDiscount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  if (product.options && product.options.length > 0) {
    for (const opt of product.options) {
      if (opt.prices) {
        for (const [v, val] of Object.entries(opt.prices)) {
          if (typeof val === 'number' && val > 0) {
            prices.push(val);
            const orig = opt.originalPrices?.[v];
            if (orig && orig > val) {
              const d = Math.round(((orig - val) / orig) * 100);
              if (maxDiscount === null || d > maxDiscount) {
                maxDiscount = d;
              }
            }
          }
        }
      }
      if (opt.stocks && Object.keys(opt.stocks).length > 0) {
        hasOptionStock = true;
        totalOptionStock += Object.values(opt.stocks).reduce(
          (sum, s) => sum + (typeof s === 'number' ? s : 0),
          0
        );
      }
    }
  }

  const uniquePrices = Array.from(new Set(prices));
  const minPrice = Math.min(...uniquePrices);
  const maxPrice = Math.max(...uniquePrices);
  const hasRange = uniquePrices.length > 1 && minPrice !== maxPrice;

  return {
    minPrice,
    maxPrice,
    hasRange,
    allPrices: uniquePrices,
    maxDiscountPercent: maxDiscount,
    hasOptionStock,
    totalOptionStock
  };
}

/**
 * Generate a clean Order ID in format: NY-XXXX
 */
export function generateOrderId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `NY-${randomNum}`;
}

/**
 * Format current timestamp for Lao display
 */
export function getCurrentDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Generate WhatsApp message URL to notify customer or store owner
 */
export function createWhatsAppUrl(
  phone: string,
  order: Order,
  type: 'admin_notify' | 'customer_notify' | 'payment_reminder' = 'customer_notify'
): string {
  // Clean phone number: if starts with 020, change to 85620
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('020')) {
    cleanPhone = '85620' + cleanPhone.slice(3);
  } else if (cleanPhone.startsWith('20')) {
    cleanPhone = '856' + cleanPhone;
  } else if (!cleanPhone.startsWith('856') && cleanPhone.length > 0) {
    cleanPhone = '85620' + cleanPhone;
  }

  const itemsList = order.items
    .map(
      (item) =>
        `- ${item.product.name} (${Object.values(item.selectedOptions).join(', ') || 'ມາດຕະຖານ'}) x${item.quantity} = ${formatLAK(item.price * item.quantity)}`
    )
    .join('\n');

  let text = '';
  if (type === 'admin_notify') {
    text = `🌸 *ແຈ້ງເຕືອນອໍເດີ້ໃໝ່ຈາກ NY Beauty Shop!*
📦 *ລະຫັດອໍເດີ້:* #${order.id}
👤 *ລູກຄ້າ:* ${order.customerName}
📞 *ເບີໂທ:* ${order.customerPhone}
📍 *ທີ່ຢູ່:* ${order.address} (${order.province || ''})
🚚 *ຂົນສົ່ງ:* ${order.shippingProvider}
💰 *ຍອດລວມ:* ${formatLAK(order.total)}
🛒 *ລາຍການສິນຄ້າ:*
${itemsList}

ກະລຸນາກວດສອບສະລິບ ແລະ ແພັກສິນຄ້າ. ຂອບໃຈ!`;
  } else if (type === 'payment_reminder') {
    text = `ສະບາຍດີທ່ານ ${order.customerName} 🙏
ຈາກຮ້ານ *NY Beauty Shop* 🌸
ແຈ້ງເຕືອນລາຍການສັ່ງຊື້ *#${order.id}*
💰 *ຍອດລວມທີ່ຕ້ອງຊຳລະ:* ${formatLAK(order.total)}
🛒 *ລາຍການສິນຄ້າ:* ${order.items.length} ຢ່າງ
🚚 *ຂົນສົ່ງ:* ${order.shippingProvider}

ກະລຸນາໂອນຊຳລະຜ່ານ BCEL One ແລະ ສົ່ງໃບສະລິບການໂອນເງິນເພື່ອກວດສອບ ແລະ ຈັດກຽມຈັດສົ່ງສິນຄ້າໃຫ້ໄວທີ່ສຸດ. ຂອບໃຈຫຼາຍໆ! 💖`;
  } else {
    // Customer status update message
    let statusLao = 'ໄດ້ຮັບອໍເດີ້ແລ້ວ';
    if (order.status === 'paid') statusLao = 'ກວດສອບຍອດຊຳລະຮຽບຮ້ອຍ ✅';
    if (order.status === 'packing') statusLao = 'ກຳລັງແພັກສິນຄ້າລົງກ່ອງ 🎁';
    if (order.status === 'shipped') statusLao = `ຈັດສົ່ງຮຽບຮ້ອຍແລ້ວ 🚚 (ເລກພັດສະດຸ: ${order.trackingNumber || 'ລໍຖ້າອັບເດດ'})`;
    if (order.status === 'completed') statusLao = 'ສິນຄ້າຈັດສົ່ງຮອດມືທ່ານຮຽບຮ້ອຍ 🎉';

    text = `ສະບາຍດີທ່ານ ${order.customerName} 🙏
ຈາກຮ້ານ *NY Beauty Shop* 🌸
ອັບເດດສະຖານະອໍເດີ້ *#${order.id}*:
👉 *ສະຖານະ:* ${statusLao}
🚚 *ບໍລິສັດຂົນສົ່ງ:* ${order.shippingProvider}
${order.trackingNumber ? `📦 *ເລກພັດສະດຸ (Tracking):* ${order.trackingNumber}\n` : ''}💰 *ຍອດລວມ:* ${formatLAK(order.total)}

ສາມາດຕິດຕາມພັດສະດຸຜ່ານເວັບໄຊ ຫຼື ສອບຖາມເພີ່ມເຕີມໄດ້ຕະຫຼອດເວລາ. ຂອບໃຈຫຼາຍໆ! 💖`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
