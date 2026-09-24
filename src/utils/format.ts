import { Order, ShippingProvider } from '../types';

/**
 * Format numbers as Lao Kip currency (₭)
 */
export function formatLAK(amount: number): string {
  return `₭${amount.toLocaleString('en-US')}`;
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
