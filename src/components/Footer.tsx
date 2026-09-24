import React from 'react';
import { Phone, MessageCircle, MapPin, Truck, Heart, Facebook, Monitor, Smartphone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { NyStoreLogo } from './NyStoreLogo';

export const Footer: React.FC<{ onOpenTracking: () => void }> = ({
  onOpenTracking
}) => {
  const { storeSettings, viewMode, setViewMode } = useStore();

  const facebookUrl =
    storeSettings.facebookUrl ||
    'https://www.facebook.com/share/1B59iN8jJG/?mibextid=wwXIfr';
  const facebookName = storeSettings.facebookPageName || 'NY Beauty SHop';

  return (
    <footer className="bg-white border-t border-pink-100 mt-16 text-neutral-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div>
              <NyStoreLogo variant="horizontal" size="sm" />
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              ຮ້ານຄ້າອອນລາຍສິນຄ້າຄຸນນະພາບ ຊື້ງ່າຍ ສະດວກ ປອດໄພ ບໍ່ຕ້ອງລົງທະບຽນ ຊຳລະສະດວກຜ່ານ BCEL One.
            </p>
            <div className="text-xs text-pink-600 font-medium flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              <span>ບໍລິການດ້ວຍໃຈ ຈັດສົ່ງທົ່ວປະເທດ</span>
            </div>
            <div className="pt-1">
              <a
                id="footer-brand-fb-link"
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors shadow-2xs group"
              >
                <Facebook className="w-3.5 h-3.5 fill-blue-600 text-blue-600 group-hover:scale-110 transition-transform" />
                <span>Facebook: {facebookName}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              ບໍລິການລູກຄ້າ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenTracking}
                  className="hover:text-pink-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-pink-500" />
                  <span>ຕິດຕາມພັດສະດຸ (Order Tracking)</span>
                </button>
              </li>
              <li className="text-neutral-400">
                ນະໂຍບາຍການຈັດສົ່ງສິນຄ້າ
              </li>
              <li className="text-neutral-400">
                ການຮັບປະກັນສິນຄ້າ
              </li>
            </ul>
          </div>

          {/* Shipping & Payment */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              ການຈັດສົ່ງ & ການຊຳລະເງິນ
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] text-neutral-400 block">ຊ່ອງທາງຂົນສົ່ງ:</span>
                <div className="flex flex-wrap gap-1 mt-1 font-semibold text-neutral-700">
                  <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md border border-pink-200">
                    Anusith
                  </span>
                  <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md border border-pink-200">
                    HAL Logistics
                  </span>
                  <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md border border-pink-200">
                    Mixay
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[11px] text-neutral-400 block">ການຊຳລະເງິນ:</span>
                <span className="inline-block mt-1 font-bold text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-md border border-red-200">
                  BCEL OnePay QR Code
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              ຕິດຕໍ່ຮ້ານຄ້າ
            </h4>
            <div className="space-y-2 text-xs text-neutral-600">
              <a
                id="footer-contact-fb-link"
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold transition-colors group"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Facebook className="w-3 h-3 fill-white text-white" />
                </div>
                <span className="truncate">FACEBOOK: {facebookName}</span>
              </a>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                <span>ໂທ: {storeSettings.storePhone}</span>
              </div>
              <a
                href={`https://wa.me/${storeSettings.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>WhatsApp: {storeSettings.storePhone}</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                <span>ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Display Mode Switcher (ໂໝດມືຖື vs ໂໝດຄອມພິວເຕີ) */}
        <div className="pt-6 border-t border-pink-100/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-neutral-600">ໂໝດສະແດງຜົນເວັບໄຊ:</span>
            <div className="inline-flex rounded-full p-1 bg-pink-50 border border-pink-200 shadow-2xs">
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'mobile'
                    ? 'bg-white text-pink-600 shadow-xs border border-pink-200'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                title="ສະແດງຜົນແບບມືຖື (Mobile View)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>📱 ໂໝດມືຖື</span>
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'desktop'
                    ? 'bg-white text-pink-600 shadow-xs border border-pink-200'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
                title="ສະແດງຜົນແບບຄອມພິວເຕີ (Desktop View)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>🖥️ ໂໝດຄອມພິວເຕີ (Desktop)</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-neutral-400">
            {viewMode === 'desktop' ? '💡 ສະແດງຜົນເຕັມຈໍແບບ Desktop PC' : '💡 ສະແດງຜົນແບບສະດວກສຳລັບໜ້າຈໍມືຖື'}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-pink-100/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-2">
          <div>
            © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved. ຮ້ານຄ້າອອນລາຍພາສາລາວ.
          </div>
          <div className="text-neutral-400">
            ລະບົບຊື້-ຂາຍອັດຕະໂນມັດ 100%
          </div>
        </div>
      </div>
    </footer>
  );
};
