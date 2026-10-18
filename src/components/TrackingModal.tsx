import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  Copy,
  AlertCircle,
  Printer
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { formatLAK, createWhatsAppUrl } from '../utils/format';
import { STATUS_CONFIG, SHIPPING_PROVIDERS_CONFIG } from '../data/initialData';
import { printReceipt } from '../utils/receipt';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

export const TrackingModal: React.FC<TrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderId
}) => {
  const { orders, storeSettings } = useStore();
  const [searchCode, setSearchCode] = useState(initialOrderId || '');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      setSearchCode(initialOrderId);
      const found = orders.find(
        (o) =>
          o.id.toLowerCase() === initialOrderId.trim().toLowerCase() ||
          o.customerPhone.includes(initialOrderId.trim())
      );
      setMatchedOrder(found || null);
      setSearched(true);
    }
  }, [initialOrderId, orders]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    const term = searchCode.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === term ||
        o.customerPhone.includes(term) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase() === term)
    );
    setMatchedOrder(found || null);
    setSearched(true);
  };

  const steps = [
    { key: 'pending_payment', label: 'ລໍຖ້າຊຳລະ' },
    { key: 'paid', label: 'ຊຳລະແລ້ວ' },
    { key: 'packing', label: 'ກຳລັງແພັກ' },
    { key: 'shipped', label: 'ຈັດສົ່ງແລ້ວ' },
    { key: 'completed', label: 'ສຳເລັດ' }
  ];

  const currentStepIndex = matchedOrder ? STATUS_CONFIG[matchedOrder.status]?.step || 1 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        id="tracking-modal-panel"
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-pink-100 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-pink-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-neutral-900">
                ຕິດຕາມສະຖານະພັດສະດຸ
              </h2>
              <p className="text-xs text-neutral-500">
                ກວດສອບສະຖານະການຈັດສົ່ງ ແລະ ເລກ Tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pink-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Search Input Box */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700">
              ປ້ອນລະຫັດອໍເດີ້ (Order ID) ຫຼື ເບີໂທລະສັບ:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="ເຊັ່ນ: NY-9041 ຫຼື 020 55123456"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 text-sm outline-hidden"
                />
                <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-pink-200 transition-all cursor-pointer shrink-0"
              >
                ຄົ້ນຫາ
              </button>
            </div>
          </form>

          {/* Result Section */}
          {searched && !matchedOrder && (
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-neutral-400 mx-auto" />
              <div>
                <h4 className="font-bold text-neutral-800 text-sm">
                  ບໍ່ພົບຂໍ້ມູນອໍເດີ້: "{searchCode}"
                </h4>
                <p className="text-xs text-neutral-500 mt-1">
                  ກະລຸນາກວດສອບລະຫັດອໍເດີ້ ຫຼື ເບີໂທລະສັບທີ່ທ່ານໃຊ້ໃນການສັ່ງຊື້ໃຫ້ຖືກຕ້ອງ
                </p>
              </div>
            </div>
          )}

          {matchedOrder && (
            <div className="space-y-5">
              {/* Order Status Badge & ID */}
              <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-500">ລະຫັດອໍເດີ້:</span>
                  <div className="font-extrabold text-lg text-pink-600">
                    #{matchedOrder.id}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    ສັ່ງຊື້ເມື່ອ: {matchedOrder.createdAt}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      STATUS_CONFIG[matchedOrder.status]?.bg || 'bg-neutral-100'
                    } ${STATUS_CONFIG[matchedOrder.status]?.color || 'text-neutral-700'} border ${
                      STATUS_CONFIG[matchedOrder.status]?.border || 'border-neutral-200'
                    }`}
                  >
                    {STATUS_CONFIG[matchedOrder.status]?.label || matchedOrder.status}
                  </span>
                </div>
              </div>

              {/* Progress Timeline Stepper */}
              <div className="py-2">
                <div className="relative flex items-center justify-between">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-200 w-full z-0"></div>
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-pink-500 transition-all duration-500 z-0"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((currentStepIndex - 1) / 4) * 100))}%`
                    }}
                  ></div>

                  {steps.map((st, i) => {
                    const stepNum = i + 1;
                    const isDone = currentStepIndex >= stepNum;
                    const isCurrent = currentStepIndex === stepNum;

                    return (
                      <div key={st.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-pink-500 text-white ring-4 ring-pink-100 scale-110'
                              : isDone
                              ? 'bg-pink-500 text-white'
                              : 'bg-white text-neutral-400 border-2 border-neutral-200'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                        </div>
                        <span
                          className={`text-[10px] mt-1.5 font-medium text-center whitespace-nowrap ${
                            isCurrent
                              ? 'text-pink-600 font-bold'
                              : isDone
                              ? 'text-neutral-800'
                              : 'text-neutral-400'
                          }`}
                        >
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking Number Card if Shipped */}
              <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-pink-500" />
                    <span>ບໍລິສັດຂົນສົ່ງ:</span>
                  </span>
                  <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                    {matchedOrder.shippingProvider} ({SHIPPING_PROVIDERS_CONFIG[matchedOrder.shippingProvider]?.laoName})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <span className="text-xs text-neutral-500">ເລກພັດສະດຸ (Tracking No.):</span>
                  {matchedOrder.trackingNumber ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
                        {matchedOrder.trackingNumber}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(matchedOrder.trackingNumber || '');
                          alert('ຄັດລອກເລກພັດສະດຸແລ້ວ');
                        }}
                        className="p-1 text-pink-600 hover:text-pink-700 cursor-pointer"
                        title="ຄັດລອກ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">
                      ກຳລັງກຽມພັດສະດຸ (ລໍຖ້າເລກແທຣັກ)
                    </span>
                  )}
                </div>

                <div className="text-xs text-neutral-600 pt-2 border-t border-neutral-100 space-y-1">
                  <div><span className="text-neutral-400">ຜູ້ຮັບ:</span> {matchedOrder.customerName} ({matchedOrder.customerPhone})</div>
                  <div><span className="text-neutral-400">ທີ່ຢູ່:</span> {matchedOrder.address}</div>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-neutral-700">ສິນຄ້າໃນອໍເດີ້:</h5>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {matchedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div className="truncate">
                          <div className="font-semibold text-neutral-800 truncate">
                            {item.product.name}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            ຈຳນວນ: {item.quantity} | {Object.values(item.selectedOptions).join(', ')}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-pink-600 shrink-0">
                        {formatLAK(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Print Receipt & Contact Shop WhatsApp */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => printReceipt(matchedOrder, storeSettings)}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4 text-pink-400" />
                  <span>ພິມໃບບິນ / ດາວໂຫຼດ PDF (Print Receipt)</span>
                </button>

                <a
                  href={createWhatsAppUrl(storeSettings.whatsappNumber, matchedOrder, 'customer_notify')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ສອບຖາມຮ້ານຄ້າຜ່ານ WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
