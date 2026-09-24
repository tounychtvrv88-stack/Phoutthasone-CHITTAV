import React, { useState } from 'react';
import {
  X,
  QrCode,
  Upload,
  CheckCircle2,
  Copy,
  Check,
  Truck,
  MessageCircle,
  FileText,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Printer,
  Receipt,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ShippingProvider, Order, CartItem } from '../types';
import { formatLAK, createWhatsAppUrl } from '../utils/format';
import { SHIPPING_PROVIDERS_CONFIG } from '../data/initialData';
import { printReceipt } from '../utils/receipt';
import { NyStoreLogo } from './NyStoreLogo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  directBuyItem?: CartItem | null;
  onOpenTracking: (orderId?: string) => void;
}

const LAO_PROVINCES = [
  'ນະຄອນຫຼວງວຽງຈັນ',
  'ຫຼວງພະບາງ',
  'ຈຳປາສັກ',
  'ສະຫວັນນະເຂດ',
  'ວຽງຈັນ (ແຂວງ)',
  'ຄຳມ່ວນ',
  'ໄຊຍະບູລີ',
  'ຊຽງຂວາງ',
  'ບໍລິຄຳໄຊ',
  'ອຸດົມໄຊ',
  'ບໍ່ແກ້ວ',
  'ຫຼວງນ້ຳທາ',
  'ຜົ້ງສາລີ',
  'ຫົວພັນ',
  'ສາລະວັນ',
  'ເຊກອງ',
  'ອັດຕະປື',
  'ໄຊສົມບູນ'
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  directBuyItem,
  onOpenTracking
}) => {
  const { cart, cartSubtotal, storeSettings, createOrder } = useStore();

  // Determine items being purchased: either direct buy or current cart
  const itemsToCheckout = directBuyItem ? [directBuyItem] : cart;
  const itemsSubtotal = directBuyItem
    ? directBuyItem.price * directBuyItem.quantity
    : cartSubtotal;

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [province, setProvince] = useState(LAO_PROVINCES[0]);
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [shippingProvider, setShippingProvider] = useState<ShippingProvider>('Anusith');
  const [notes, setNotes] = useState('');

  // Slip upload
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [slipFileName, setSlipFileName] = useState<string>('');

  // Copied account number feedback
  const [isCopiedAccount, setIsCopiedAccount] = useState(false);
  const [isCopiedOrder, setIsCopiedOrder] = useState(false);
  const [isReceiptExpanded, setIsReceiptExpanded] = useState(false);

  // Completed Order State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentShippingRate = storeSettings.shippingRates?.[shippingProvider] ?? 0;
  const grandTotal = itemsSubtotal + currentShippingRate;

  // Handle Slip Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlipFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSlipImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(storeSettings.bcelAccountNumber.replace(/-/g, ''));
    setIsCopiedAccount(true);
    setTimeout(() => setIsCopiedAccount(false), 2000);
  };

  // Submit Order
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('ກະລຸນາປ້ອນ ຊື່ ແລະ ນາມສະກຸນ ຂອງຜູ້ຮັບ');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      setErrorMessage('ກະລຸນາປ້ອນ ເບີໂທລະສັບ ໃຫ້ຖືກຕ້ອງ (ເຊັ່ນ: 020 5xxxxxxx)');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('ກະລຸນາປ້ອນ ລາຍລະອຽດທີ່ຢູ່ຈັດສົ່ງ (ບ້ານ, ເມືອງ, ຈຸດສັງເກດ)');
      return;
    }
    if (!slipImage) {
      setErrorMessage('ກະລຸນາ ແນບໃບສະລິບການໂອນເງິນ BCEL One ກ່ອນຢືນຢັນ');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddress = `${address}, ເມືອງ ${district || 'ໃກ້ຄຽງ'}, ແຂວງ ${province}`;
      const newOrder = createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        address: fullAddress,
        province,
        district,
        shippingProvider,
        items: itemsToCheckout,
        subtotal: itemsSubtotal,
        shippingFee: currentShippingRate,
        total: grandTotal,
        paymentSlipUrl: slipImage,
        paymentMethod: 'BCEL_ONE',
        status: 'paid', // Mark as paid since slip is attached!
        notes
      });

      setCompletedOrder(newOrder);
    } catch (err) {
      setErrorMessage('ເກີດຂໍ້ຜິດພາດໃນການສ້າງອໍເດີ້ ກະລຸນາລອງໃໝ່');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        id="checkout-modal-panel"
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-pink-100 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-gradient-to-r from-pink-50/70 to-rose-50/70">
          <div>
            <h2 className="font-bold text-lg sm:text-xl text-neutral-900">
              {completedOrder ? 'ສັ່ງຊື້ສຳເລັດແລ້ວ! 🎉' : 'ໜ້າຊຳລະເງິນ (Checkout)'}
            </h2>
            <p className="text-xs text-neutral-500">
              {completedOrder
                ? `ລະຫັດອໍເດີ້ຂອງທ່ານ: #${completedOrder.id}`
                : 'ຊຳລະຜ່ານ BCEL OnePay & ຢືນຢັນຂໍ້ມູນການຈັດສົ່ງ'}
            </p>
          </div>
          <button
            id="close-checkout-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pink-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {completedOrder ? (
            /* =================== ORDER SUCCESS VIEW =================== */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-pink-100 text-pink-700">
                  ໄດ້ຮັບອໍເດີ້ ແລະ ໃບສະລິບຮຽບຮ້ອຍແລ້ວ
                </span>
                <h3 className="text-2xl font-black text-neutral-900 mt-2">
                  ຂອບໃຈສຳລັບການສັ່ງຊື້ 🌸
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-md mx-auto">
                  ຮ້ານ <span className="font-bold text-pink-600">Ny Store</span> ຈະກວດສອບສະລິບ ແລະ ກຽມຈັດສົ່ງສິນຄ້າໃຫ້ໄວທີ່ສຸດ
                </p>
              </div>

              {/* Order ID Highlight Card */}
              <div className="bg-pink-50/80 border border-pink-200 rounded-2xl p-4 max-w-md mx-auto space-y-2">
                <span className="text-xs text-neutral-500 font-medium">ລະຫັດອໍເດີ້ສິນຄ້າ (Order ID):</span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-pink-600 tracking-wider">
                    {completedOrder.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(completedOrder.id);
                      setIsCopiedOrder(true);
                      setTimeout(() => setIsCopiedOrder(false), 2000);
                    }}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isCopiedOrder
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                        : 'bg-white border-pink-200 text-pink-600 hover:bg-pink-100 shadow-xs'
                    }`}
                    title="ຄັດລອກລະຫັດອໍເດີ້"
                  >
                    {isCopiedOrder ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-[11px] text-neutral-500 pt-1 border-t border-pink-200/60">
                  {isCopiedOrder ? (
                    <span className="text-emerald-600 font-semibold">✓ ຄັດລອກລະຫັດອໍເດີ້ຮຽບຮ້ອຍແລ້ວ</span>
                  ) : (
                    'ກະລຸນາບັນທຶກລະຫັດນີ້ໄວ້ສຳລັບຕິດຕາມພັດສະດຸ'
                  )}
                </div>
              </div>

              {/* Order Summary Details */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-4 text-left text-xs space-y-2.5 max-w-md mx-auto shadow-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">ຜູ້ຮັບ:</span>
                  <span className="font-semibold text-neutral-900">{completedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ເບີໂທ:</span>
                  <span className="font-semibold text-neutral-900">{completedOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ຂົນສົ່ງ:</span>
                  <span className="font-bold text-pink-600">{completedOrder.shippingProvider} Express</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">ທີ່ຢູ່:</span>
                  <span className="font-medium text-neutral-800 text-right max-w-[240px] truncate">
                    {completedOrder.address}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex justify-between items-baseline">
                  <span className="font-bold text-neutral-800">ຍອດຊຳລະທັງໝົດ:</span>
                  <span className="text-base font-black text-pink-600">{formatLAK(completedOrder.total)}</span>
                </div>

                {/* Receipt Details Toggle */}
                <div className="pt-2 border-t border-dashed border-pink-200/70">
                  <button
                    type="button"
                    onClick={() => setIsReceiptExpanded(!isReceiptExpanded)}
                    className="w-full text-center text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center justify-center gap-1.5 py-1 cursor-pointer transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{isReceiptExpanded ? 'ຫຍໍ້ລາຍການສິນຄ້າ' : `ເບິ່ງລາຍການສິນຄ້າ (${completedOrder.items.length} ລາຍການ)`}</span>
                    {isReceiptExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isReceiptExpanded && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-pink-100 animate-fadeIn">
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {completedOrder.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-xl bg-pink-50/40 border border-pink-100/80 text-[11px]"
                          >
                            <div className="flex-1 pr-2">
                              <div className="font-semibold text-neutral-800 line-clamp-1">{item.product.name}</div>
                              {Object.keys(item.selectedOptions || {}).length > 0 && (
                                <div className="text-[10px] text-pink-500">
                                  {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                </div>
                              )}
                              <div className="text-neutral-400 text-[10px]">
                                {formatLAK(item.price)} × {item.quantity}
                              </div>
                            </div>
                            <div className="font-bold text-neutral-800 shrink-0">
                              {formatLAK(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-2 rounded-xl bg-neutral-50 text-[11px] space-y-1 text-neutral-600">
                        <div className="flex justify-between">
                          <span>ຍອດລວມທັງໝົດ:</span>
                          <span className="font-bold text-neutral-900">{formatLAK(completedOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 max-w-md mx-auto pt-1">
                {/* 1. Print / Download PDF Receipt Button */}
                <button
                  id="print-order-receipt-btn"
                  type="button"
                  onClick={() => printReceipt(completedOrder, storeSettings)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-md shadow-neutral-300 flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Printer className="w-4 h-4 text-pink-400" />
                  <span>ພິມໃບບິນ / ດາວໂຫຼດ PDF (Print Receipt)</span>
                </button>
                <p className="text-[10px] text-neutral-400 text-center">
                  💡 ໃນໜ້າຕ່າງການພິມ ສາມາດເລືອກ "Save as PDF" ເພື່ອດາວໂຫຼດໃບບິນເກັບໄວ້ໄດ້
                </p>

                {/* 2. WhatsApp Direct Notify Button */}
                <a
                  href={createWhatsAppUrl(storeSettings.whatsappNumber, completedOrder, 'admin_notify')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ແຈ້ງເຕືອນອໍເດີ້ຜ່ານ WhatsApp ທັນທີ</span>
                </a>

                {/* 3. Track Button */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenTracking(completedOrder.id);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Truck className="w-4 h-4 text-pink-500" />
                  <span>ຕິດຕາມສະຖານະພັດສະດຸ</span>
                </button>

                {/* 4. Return button */}
                <button
                  onClick={onClose}
                  className="text-xs text-neutral-400 hover:text-neutral-600 py-1"
                >
                  ກັບຄືນໜ້າຫຼັກເລືອກຊື້ສິນຄ້າຕໍ່
                </button>
              </div>

              {/* Native Print Element Fallback for Ctrl+P */}
              <div id="printable-order-receipt" className="hidden print:block text-neutral-900 bg-white p-6">
                <div className="border-b-2 border-pink-200 pb-4 mb-4 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <NyStoreLogo variant="icon" size="lg" />
                    <div>
                      <h1 className="text-xl font-black text-pink-600">{storeSettings.storeName}</h1>
                      <p className="text-xs text-neutral-500">BEAUTY & FASHION • ຮ້ານຄ້າອອນລາຍ ນະຄອນຫຼວງວຽງຈັນ</p>
                      <p className="text-xs text-neutral-500">
                        ໂທ: {storeSettings.storePhone} | Facebook: {storeSettings.facebookPageName || 'NY Beauty SHop'} | WhatsApp: {storeSettings.whatsappNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-base font-bold text-neutral-900">ໃບບິນຮັບເງິນ / RECEIPT</h2>
                    <p className="text-sm font-bold text-pink-600">#{completedOrder.id}</p>
                    <p className="text-[11px] text-neutral-500">{completedOrder.createdAt}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-3 bg-pink-50 rounded-xl mb-4 text-xs">
                  <div>
                    <p className="font-bold text-pink-700 mb-1">ຂໍ້ມູນຜູ້ຮັບ (Customer):</p>
                    <p><strong>ຊື່:</strong> {completedOrder.customerName}</p>
                    <p><strong>ເບີໂທ:</strong> {completedOrder.customerPhone}</p>
                    <p><strong>ທີ່ຢູ່:</strong> {completedOrder.address}</p>
                  </div>
                  <div>
                    <p className="font-bold text-pink-700 mb-1">ການຈັດສົ່ງ & ຊຳລະ:</p>
                    <p><strong>ຂົນສົ່ງ:</strong> {completedOrder.shippingProvider} Express</p>
                    <p><strong>ເລກ Tracking:</strong> {completedOrder.trackingNumber || 'ລໍຖ້າອັບເດດ'}</p>
                    <p><strong>ວິທີຊຳລະ:</strong> BCEL OnePay QR Code (ຊຳລະແລ້ວ)</p>
                  </div>
                </div>

                <table className="w-full text-xs border-collapse mb-4">
                  <thead>
                    <tr className="border-b-2 border-neutral-300 text-neutral-600">
                      <th className="py-2 text-left">#</th>
                      <th className="py-2 text-left">ລາຍການສິນຄ້າ</th>
                      <th className="py-2 text-right">ລາຄາຕໍ່ໜ່ວຍ</th>
                      <th className="py-2 text-center">ຈຳນວນ</th>
                      <th className="py-2 text-right">ລວມ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-neutral-100">
                        <td className="py-2">{idx + 1}</td>
                        <td className="py-2">
                          <div className="font-semibold">{item.product.name}</div>
                          {Object.keys(item.selectedOptions || {}).length > 0 && (
                            <div className="text-[10px] text-pink-600">
                              {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-2 text-right">{formatLAK(item.price)}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right font-bold">{formatLAK(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mb-6 text-xs">
                  <div className="w-64 space-y-1">
                    <div className="flex justify-between py-2 border-t-2 border-neutral-800 font-bold text-sm text-pink-600">
                      <span>ຍອດຊຳລະສຸດທິ:</span>
                      <span>{formatLAK(completedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[11px] text-neutral-400 border-t border-dashed border-neutral-200 pt-4">
                  <p className="font-semibold text-pink-600">🌸 ຂອບໃຈຫຼາຍໆ ທີ່ເລືອກຊື້ສິນຄ້າກັບ {storeSettings.storeName} 🌸</p>
                  <p>ກະລຸນາເກັບຮັກສາໃບບິນນີ້ໄວ້ສຳລັບການຕິດຕາມພັດສະດຸ</p>
                </div>
              </div>
            </div>
          ) : (
            /* =================== CHECKOUT FORM VIEW =================== */
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* 1. Order Summary Strip */}
              <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500">ລາຍການສັ່ງຊື້ ({itemsToCheckout.length} ລາຍການ):</span>
                  <div className="font-bold text-sm text-neutral-800">
                    ຍອດສິນຄ້າ: {formatLAK(itemsSubtotal)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-500">ຍອດລວມສຸດທິ:</span>
                  <div className="font-black text-lg text-pink-600">
                    {formatLAK(grandTotal)}
                  </div>
                </div>
              </div>

              {/* 2. BCEL OnePay QR Code Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-white to-pink-50/30 border-2 border-pink-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-xs tracking-tighter shadow-xs">
                      BCEL
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 leading-tight">
                        BCEL OnePay QR Code
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        ສະແກນ QR ຈ່າຍເງິນຜ່ານແອັບ BCEL One
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full">
                    OnePay
                  </span>
                </div>

                {/* QR Code Container with BCEL Logo Style */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
                  {/* Real BCEL QR image */}
                  <div className="relative p-2 bg-white rounded-xl border-2 border-red-500/80 shadow-md shrink-0 flex flex-col items-center">
                    <img
                      src={storeSettings.bcelQrImage || '/bcel-qr.jpg'}
                      alt="BCEL OnePay QR Code"
                      className="w-36 sm:w-44 h-auto max-h-56 object-contain rounded-lg shadow-inner bg-white"
                      referrerPolicy="no-referrer"
                    />
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      <span>ສະແກນ QR ດ້ວຍ BCEL One</span>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-2 text-xs w-full text-center sm:text-left">
                    <div>
                      <span className="text-neutral-400 text-[11px]">ຊື່ບັນຊີ (Account Name):</span>
                      <div className="font-bold text-neutral-800 text-sm">
                        {storeSettings.bcelAccountName}
                      </div>
                    </div>

                    <div>
                      <span className="text-neutral-400 text-[11px]">ເລກບັນຊີ (Account No.):</span>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                        <span className="font-mono font-bold text-neutral-900 text-sm tracking-wide bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-200">
                          {storeSettings.bcelAccountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="p-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 transition-colors cursor-pointer"
                          title="ຄັດລອກເລກບັນຊີ"
                        >
                          {isCopiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-neutral-400 text-[11px]">ຈຳນວນເງິນທີ່ຕ້ອງໂອນ:</span>
                      <div className="text-lg font-black text-rose-600">
                        {formatLAK(grandTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Customer Info Form (ຊື່, ເບີ, ທີ່ຢູ່, ຂົນສົ່ງ) */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>ຂໍ້ມູນຜູ້ຮັບ ແລະ ທີ່ຢູ່ຈັດສົ່ງ</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      ຊື່ ແລະ ນາມສະກຸນ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ເຊັ່ນ: ນາງ ມາລີ ວົງພະຈັນ"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-hidden"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      ເບີໂທລະສັບ (WhatsApp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="ເຊັ່ນ: 020 55123456"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-hidden"
                    />
                  </div>
                </div>

                {/* Province & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      ແຂວງ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-hidden bg-white"
                    >
                      {LAO_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      ເມືອງ
                    </label>
                    <input
                      type="text"
                      placeholder="ເຊັ່ນ: ຈັນທະບູລີ, ໄຊເສດຖາ, ປາກເຊ..."
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-hidden"
                    />
                  </div>
                </div>

                {/* Detailed Village / Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">
                    ບ້ານ / ທີ່ຢູ່ລະອຽດ / ຈຸດສັງເກດ <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="ເຊັ່ນ: ບ້ານ ດົງປ່າລານທົ່ງ, ຮ່ອມ 3, ໃກ້ກັບຕະຫຼາດເຊົ້າ, ຕິດປ້ຳນ້ຳມັນ..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-hidden resize-none"
                  />
                </div>

                {/* Shipping Provider Selection (Anusith, Hal, Mixay) */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-neutral-700">
                    ເລືອກບໍລິສັດຂົນສົ່ງ <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(Object.keys(SHIPPING_PROVIDERS_CONFIG) as ShippingProvider[]).map((key) => {
                      const prov = SHIPPING_PROVIDERS_CONFIG[key];
                      const isSelected = shippingProvider === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setShippingProvider(key)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-pink-500 bg-pink-50/80 ring-2 ring-pink-200 shadow-xs'
                              : 'border-neutral-200 bg-white hover:border-pink-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs sm:text-sm text-neutral-900">
                                {prov.name}
                              </span>
                              {isSelected && <Check className="w-4 h-4 text-pink-600" />}
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                              {prov.laoName}
                            </div>
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-pink-100 flex items-baseline justify-between">
                            <span className="text-[10px] text-neutral-400">{prov.estimate}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">
                    ໝາຍເຫດເພີ່ມເຕີມ (ຖ້າມີ)
                  </label>
                  <input
                    type="text"
                    placeholder="ເຊັ່ນ: ຝາກໄວ້ໜ້າບ້ານ, ໂທກ່ອນສົ່ງ..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:border-pink-400 outline-hidden"
                  />
                </div>
              </div>

              {/* 4. Upload Transfer Slip (ແນບໃບສະລິບການໂອນ) */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>ແນບໃບສະລິບການໂອນເງິນ BCEL One <span className="text-rose-500">*</span></span>
                </h3>

                <div className="border-2 border-dashed border-pink-300 rounded-2xl p-4 sm:p-6 bg-pink-50/30 hover:bg-pink-50/60 transition-colors text-center relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {slipImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-28 h-36 rounded-xl overflow-hidden shadow-md border-2 border-pink-400 bg-white relative">
                        <img
                          src={slipImage}
                          alt="Uploaded slip"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ແນບສະລິບຮຽບຮ້ອຍ: {slipFileName}</span>
                      </div>
                      <span className="text-[11px] text-pink-600 underline">
                        ຄລິກເພື່ອປ່ຽນຮູບສະລິບໃໝ່
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-xs sm:text-sm text-neutral-800">
                        ກົດເພື່ອເລືອກຮູບສະລິບ ຫຼື ລາກໄຟລ໌ມາໃສ່ທີ່ນີ້
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        ຮອງຮັບໄຟລ໌ຮູບພາບ JPG, PNG, WEBP ຈາກແອັບ BCEL One
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3 border-t border-pink-100">
                <button
                  id="confirm-checkout-order-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white font-black text-sm sm:text-base shadow-xl shadow-pink-200 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {isSubmitting
                      ? 'ກຳລັງສ້າງລະຫັດອໍເດີ້...'
                      : `ຢືນຢັນການສັ່ງຊື້ (${formatLAK(grandTotal)})`}
                  </span>
                </button>
                <p className="text-[11px] text-center text-neutral-400 mt-2">
                  ຫຼັງຢືນຢັນ ລະບົບຈະສ້າງລະຫັດອໍເດີ້ (Order ID) ແລະ ຕັດສະຕັອກສິນຄ້າທັນທີ
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
