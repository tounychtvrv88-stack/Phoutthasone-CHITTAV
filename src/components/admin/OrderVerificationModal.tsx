import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Printer,
  MessageCircle,
  Phone,
  Truck,
  Package,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings } from '../../types';
import { formatLAK, createWhatsAppUrl } from '../../utils/format';
import { STATUS_CONFIG, SHIPPING_PROVIDERS_CONFIG } from '../../data/initialData';
import { printReceipt } from '../../utils/receipt';

interface OrderVerificationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  storeSettings: StoreSettings;
  onNextOrder?: () => void;
  onPrevOrder?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const OrderVerificationModal: React.FC<OrderVerificationModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  storeSettings,
  onNextOrder,
  onPrevOrder,
  hasNext = false,
  hasPrev = false
}) => {
  if (!isOpen || !order) return null;

  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('ຍອດເງິນໂອນບໍ່ກົງກັບຍອດສິນຄ້າ');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.7));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleStatusChange = (newStatus: OrderStatus, tracking?: string) => {
    onUpdateStatus(order.id, newStatus, tracking !== undefined ? tracking : order.trackingNumber);
    setSuccessMsg(`ອັບເດດສະຖານະເປັນ "${STATUS_CONFIG[newStatus]?.label || newStatus}" ສຳເລັດແລ້ວ!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveTracking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTracking(true);
    onUpdateStatus(order.id, order.status, trackingNumber);
    setSuccessMsg('ບັນທຶກເລກ Tracking ສຳເລັດ!');
    setTimeout(() => {
      setIsSavingTracking(false);
      setSuccessMsg(null);
    }, 2000);
  };

  // WhatsApp Reject message generator
  const getRejectWhatsAppUrl = () => {
    let cleanPhone = order.customerPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('020')) {
      cleanPhone = '85620' + cleanPhone.slice(3);
    } else if (cleanPhone.startsWith('20')) {
      cleanPhone = '856' + cleanPhone;
    } else if (!cleanPhone.startsWith('856') && cleanPhone.length > 0) {
      cleanPhone = '85620' + cleanPhone;
    }

    const message = `🌸 *ແຈ້ງເຕືອນຈາກ ${storeSettings.storeName}*\n\nສະບາຍດີ ລູກຄ້າ ${order.customerName},\nກ່ຽວກັບຄຳສັ່ງຊື້ເລກທີ: *#${order.id}*\nຍອດລວມ: *${formatLAK(order.total)}*\n\n⚠️ *ທາງຮ້ານຂໍແຈ້ງເຕືອນບັນຫາການໂອນເງິນ:*\n👉 "${rejectReason}"\n\nກະລຸນາກວດສອບ ຫຼື ສົ່ງໃບສະລິບໃໝ່ໃຫ້ທາງຮ້ານ ເພື່ອໃຫ້ທີມງານດຳເນີນການແພັກ ແລະ ຈັດສົ່ງສິນຄ້າໃຫ້ທ່ານໂດຍດ່ວນ.\n\nຂອບໃຈຫຼາຍໆ! 🙏`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div
        id="order-verification-dialog"
        className="relative bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-pink-100 flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-pink-950 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  ກວດສອບອໍເດີ & ຊຳລະເງິນ
                </h2>
                <span className="font-mono text-pink-300 font-extrabold text-sm sm:text-base">
                  #{order.id}
                </span>
              </div>
              <p className="text-[11px] text-neutral-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>ສັ່ງຊື້ເມື່ອ: {order.createdAt}</span>
                <span>•</span>
                <span className="text-pink-300 font-medium">ວິທີຊຳລະ: BCEL One</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Prev / Next Order Navigation */}
            <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                type="button"
                onClick={onPrevOrder}
                disabled={!hasPrev}
                className={`p-1.5 rounded-lg text-white transition-colors cursor-pointer ${
                  hasPrev ? 'hover:bg-white/20' : 'opacity-30 cursor-not-allowed'
                }`}
                title="ອໍເດີກ່ອນໜ້າ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onNextOrder}
                disabled={!hasNext}
                className={`p-1.5 rounded-lg text-white transition-colors cursor-pointer ${
                  hasNext ? 'hover:bg-white/20' : 'opacity-30 cursor-not-allowed'
                }`}
                title="ອໍເດີຖັດໄປ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Current Status Badge */}
            <span
              className={`px-3 py-1 text-xs font-black rounded-full border ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
            >
              {statusConf.label}
            </span>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Toast */}
        {successMsg && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Main Content: 2 Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-100">
          {/* ========================================================= */}
          {/* LEFT COLUMN: PAYMENT SLIP INSPECTOR (5 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col bg-neutral-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
                <h3 className="font-bold text-xs sm:text-sm text-neutral-900">
                  ໃບສະລິບການໂອນເງິນ BCEL One
                </h3>
              </div>
              {order.paymentSlipUrl && (
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 text-neutral-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg cursor-pointer"
                    title="ຊູມເຂົ້າ (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 text-neutral-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg cursor-pointer"
                    title="ຊູມອອກ (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="p-1 text-neutral-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg cursor-pointer"
                    title="ໝູນຮູບ (90°)"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-1.5 py-0.5 text-[10px] font-bold text-neutral-500 hover:text-neutral-900 rounded cursor-pointer"
                    title="ຕັ້ງຄ່າໃໝ່"
                  >
                    ຣີເຊັດ
                  </button>
                  <a
                    href={order.paymentSlipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                    title="ເປີດຮູບຕົ້ນສະບັບເຕັມຈໍ"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Slip Image Box */}
            <div className="relative flex-1 min-h-[280px] max-h-[420px] bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 flex items-center justify-center p-2 shadow-inner">
              {order.paymentSlipUrl ? (
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src={order.paymentSlipUrl}
                    alt="BCEL One Payment Slip"
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-out'
                    }}
                    className="max-h-[380px] w-auto object-contain rounded-lg shadow-md cursor-grab active:cursor-grabbing select-none"
                  />
                </div>
              ) : (
                <div className="text-center p-6 text-neutral-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-neutral-300">ຍັງບໍ່ມີໃບສະລິບການໂອນ</p>
                  <p className="text-[11px] text-neutral-500 max-w-[220px] mx-auto">
                    ລູກຄ້າຍັງບໍ່ທັນໄດ້ອັບໂຫຼດໃບສະລິບຜ່ານລະບົບ ຫຼື ເລືອກຊຳລະພາຍຫຼັງ
                  </p>
                </div>
              )}
            </div>

            {/* Slip Comparison Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-pink-100 shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-neutral-500 font-medium">ຍອດເງິນທີ່ຕ້ອງກົງໃນສະລິບ:</span>
                <span className="font-extrabold text-pink-600 font-mono text-sm sm:text-base">
                  {formatLAK(order.total)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-neutral-400 block">ຊື່ບັນຊີຮ້ານຄ້າ:</span>
                  <span className="font-bold text-neutral-800 truncate block">
                    {storeSettings.bcelAccountName}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block">ເລກບັນຊີ BCEL:</span>
                  <span className="font-mono font-bold text-neutral-800 block">
                    {storeSettings.bcelAccountNumber}
                  </span>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="pt-2 border-t border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                  ຈຸດສຳຄັນທີ່ຕ້ອງກວດໃນສະລິບ:
                </span>
                <ul className="space-y-1 text-[11px] text-neutral-600">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>ຍອດເງິນໂອນຕົງກັບ <strong>{formatLAK(order.total)}</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>ຊື່ບັນຊີປາຍທາງແມ່ນ NY BEAUTY SHOP</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>ວັນທີ & ເວລາໂອນສົມເຫດສົມຜົນກັບເວລາສັ່ງຊື້</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: ORDER DETAILS & APPROVAL ACTIONS (7 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col space-y-4 overflow-y-auto">
            {/* Action Bar: Direct 1-Click Status Approval */}
            <div className="bg-pink-50/60 rounded-2xl p-3 border border-pink-200/80 space-y-2">
              <span className="text-xs font-extrabold text-neutral-800 block">
                ⚡ ດຳເນີນການກວດສອບ & ປ່ຽນສະຖານະ:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange('paid')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    order.status === 'paid'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>ອະນຸມັດຍອດ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('packing')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    order.status === 'packing'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                      : 'bg-white hover:bg-amber-50 text-amber-800 border border-amber-300'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>ກຳລັງແພັກ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('shipped')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    order.status === 'shipped'
                      ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                      : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-300'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>ຈັດສົ່ງແລ້ວ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRejectForm(!showRejectForm)}
                  className="px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 transition-all cursor-pointer shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>ສະລິບບໍ່ຜ່ານ</span>
                </button>
              </div>

              {/* Reject Slip & WhatsApp Issue Form */}
              {showRejectForm && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-rose-200 space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-700">
                    <span>⚠️ ແຈ້ງລູກຄ້າເລື່ອງສະລິບມີບັນຫາ:</span>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="text-neutral-400 hover:text-neutral-700 text-xs cursor-pointer"
                    >
                      ປິດ
                    </button>
                  </div>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-neutral-300 outline-hidden font-medium"
                  >
                    <option value="ຍອດເງິນໂອນບໍ່ກົງກັບຍອດສິນຄ້າ">ຍອດເງິນໂອນບໍ່ກົງກັບຍອດສິນຄ້າ</option>
                    <option value="ເລກບັນຊີປາຍທາງບໍ່ຖືກຕ້ອງ">ເລກບັນຊີປາຍທາງບໍ່ຖືກຕ້ອງ</option>
                    <option value="ຮູບສະລິບບໍ່ຊັດເຈນ ຫຼື ຖືກຕັດຂອບ">ຮູບສະລິບບໍ່ຊັດເຈນ ຫຼື ຖືກຕັດຂອບ</option>
                    <option value="ສະລິບຊ້ຳກັນກັບອໍເດີອື່ນ">ສະລິບຊ້ຳກັນກັບອໍເດີອື່ນ</option>
                    <option value="ຍັງບໍ່ພົບຍອດເງິນເຂົ້າໃນບັນຊີ BCEL One">ຍັງບໍ່ພົບຍອດເງິນເຂົ້າໃນບັນຊີ BCEL One</option>
                  </select>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={getRejectWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>ສົ່ງແຈ້ງເຕືອນຫາລູກຄ້າທາງ WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('pending_payment')}
                      className="px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer"
                    >
                      ຕັ້ງເປັນລໍຖ້າຊຳລະ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Customer & Delivery Information */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  ຂໍ້ມູນຜູ້ສັ່ງຊື້ & ປາຍທາງຈັດສົ່ງ
                </h4>
                <span className="font-bold text-xs bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full">
                  {order.shippingProvider} ({SHIPPING_PROVIDERS_CONFIG[order.shippingProvider]?.laoName})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">ຊື່ລູກຄ້າ:</span>
                  <span className="font-extrabold text-neutral-900 text-sm">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">ເບີໂທຕິດຕໍ່:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-pink-600 text-sm">
                      {order.customerPhone}
                    </span>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="p-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                      title="ໂທອອກ"
                    >
                      <Phone className="w-3 h-3" />
                    </a>
                    <a
                      href={createWhatsAppUrl(order.customerPhone, order, 'customer_notify')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                      title="ແຊັດ WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-xs pt-1 border-t border-neutral-100">
                <span className="text-neutral-400 block text-[11px]">ທີ່ຢູ່ຈັດສົ່ງ:</span>
                <p className="text-neutral-700 font-medium mt-0.5 leading-relaxed bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                  {order.address}
                </p>
              </div>

              {order.notes && (
                <div className="text-xs">
                  <span className="text-neutral-400 block text-[11px]">ໝາຍເຫດຈາກລູກຄ້າ:</span>
                  <p className="text-amber-900 bg-amber-50/70 p-2 rounded-lg text-xs mt-0.5 border border-amber-200/60">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Tracking Number Input */}
            <form
              onSubmit={handleSaveTracking}
              className="bg-white rounded-2xl p-4 border border-neutral-200 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <label htmlFor="modal-tracking-input" className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-pink-500" />
                  <span>ເລກພັດສະດຸ (Tracking Number):</span>
                </label>
                {order.trackingNumber && (
                  <span className="text-[11px] text-emerald-600 font-bold">
                    ✓ ມີເລກແທຣັກແລ້ວ
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="modal-tracking-input"
                  type="text"
                  placeholder="ເຊັ່ນ: ANS-889922, HAL-002931..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 focus:border-pink-500 outline-hidden font-mono font-bold"
                />
                <button
                  type="submit"
                  disabled={isSavingTracking}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {isSavingTracking ? 'ກຳລັງບັນທຶກ...' : 'ບັນທຶກເລກ'}
                </button>
              </div>
            </form>

            {/* Ordered Items List */}
            <div className="bg-white rounded-2xl p-4 border border-neutral-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  ລາຍການສິນຄ້າ ({order.items.length} ຢ່າງ)
                </h4>
                <span className="text-xs text-neutral-500 font-medium">
                  ລວມ {order.items.reduce((s, it) => s + it.quantity, 0)} ຊິ້ນ
                </span>
              </div>

              <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto pr-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={it.product.images[0] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100'}
                        alt={it.product.name}
                        className="w-10 h-10 rounded-xl object-cover border border-neutral-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 truncate text-xs">{it.product.name}</p>
                        {Object.entries(it.selectedOptions || {}).length > 0 && (
                          <p className="text-[10px] text-pink-600 font-medium">
                            {Object.entries(it.selectedOptions)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(', ')}
                          </p>
                        )}
                        <p className="text-[11px] text-neutral-400 font-mono">
                          {formatLAK(it.price)} × {it.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="font-bold text-neutral-900 font-mono text-right shrink-0">
                      {formatLAK(it.price * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="pt-2 border-t border-neutral-100 space-y-1 text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>ຍອດລວມສິນຄ້າ:</span>
                  <span className="font-mono">{formatLAK(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>ຄ່າຈັດສົ່ງ ({order.shippingProvider}):</span>
                  <span className="font-mono">
                    {order.shippingFee === 0 ? 'ຟຣີ' : formatLAK(order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-900 font-extrabold text-sm pt-1 border-t border-neutral-100">
                  <span>ຍອດຊຳລະທັງໝົດ:</span>
                  <span className="text-pink-600 font-mono text-base">{formatLAK(order.total)}</span>
                </div>

                {/* Real-time Profit & Cost Analysis for this Order */}
                {(() => {
                  const orderCost = order.items.reduce((sum, it) => {
                    const cost = it.costPrice ?? it.product?.costPrice ?? Math.round(it.price * 0.62);
                    return sum + cost * it.quantity;
                  }, 0);
                  const orderProfit = order.subtotal - orderCost;
                  const margin = order.subtotal > 0 ? (orderProfit / order.subtotal) * 100 : 0;
                  return (
                    <div className="pt-2 border-t border-dashed border-emerald-200 bg-emerald-50/70 p-2.5 rounded-xl space-y-1 mt-1">
                      <div className="flex justify-between text-neutral-600 text-[11px]">
                        <span>ຕົ້ນທຶນສິນຄ້າໃນອໍເດີ:</span>
                        <span className="font-mono font-semibold">{formatLAK(orderCost)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-800 font-bold text-xs">
                        <span>ກຳໄລຂັ້ນຕົ້ນຈາກອໍເດີນີ້:</span>
                        <span className="font-mono font-black">+{formatLAK(orderProfit)} ({margin.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Bottom Actions: Print Receipt & WhatsApp Direct */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => printReceipt(order, storeSettings)}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-pink-400" />
                <span>ພິມໃບບິນຮັບເງິນ (Print Receipt)</span>
              </button>

              <a
                href={createWhatsAppUrl(order.customerPhone, order, 'customer_notify')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ສົ່ງໃບບິນ & ແຈ້ງລູກຄ້າຜ່ານ WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
