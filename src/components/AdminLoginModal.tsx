import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { NyStoreLogo } from './NyStoreLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginAdmin, storeSettings } = useStore();
  const [gmail, setGmail] = useState('touny.chtvrv88@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmail.trim()) {
      setErrorMsg('ກະລຸນາປ້ອນອີເມວ Gmail ຜູ້ດູແລລະບົບ');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('ກະລຸນາປ້ອນລະຫັດຜ່ານ');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const result = loginAdmin(gmail.trim(), password.trim());

    setTimeout(() => {
      setIsSubmitting(false);
      if (result.success) {
        setPassword('');
        setErrorMsg('');
        onSuccess();
      } else {
        setErrorMsg(result.message || 'ອີເມວ Gmail ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="admin-login-modal"
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-pink-100 overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header with Luxury Brand Accent */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-pink-950 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <NyStoreLogo variant="icon" size="md" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neutral-900 border border-pink-400 flex items-center justify-center text-pink-400 shadow-xs">
                <Lock className="w-3 h-3" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-pink-300">
                  {storeSettings.storeName} Back-Office
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-pink-500/30 text-pink-200 border border-pink-400/30 font-bold">
                  Security
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                ເຂົ້າສູ່ລະບົບຜູ້ດູແລ
              </h2>
            </div>
          </div>
          <p className="text-xs text-neutral-300/80 mt-2">
            ກະລຸນາປ້ອນບັນຊີ Gmail ແລະ ລະຫັດຜ່ານທີ່ໄດ້ຮັບອະນຸຍາດເທົ່ານັ້ນ
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <span className="font-bold">ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Gmail Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700">
              ອີເມວ Gmail ຜູ້ດູແລ (Admin Gmail):
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                <Mail className="w-4 h-4 text-pink-600" />
              </div>
              <input
                id="admin-login-gmail-input"
                type="email"
                required
                autoComplete="email"
                placeholder="ຕົວຢ່າງ: touny.chtvrv88@gmail.com"
                value={gmail}
                onChange={(e) => {
                  setGmail(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 rounded-2xl border border-neutral-200 focus:border-pink-500 focus:bg-white outline-hidden transition-all font-medium text-neutral-900"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              ລະບົບຮອງຮັບສະເພາະບັນຊີ Gmail ທີ່ລົງທະບຽນເປັນ Admin ເທົ່ານັ້ນ
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-700">
                ລະຫັດຜ່ານ (Password):
              </label>
              <span className="text-[11px] text-pink-600 font-medium">
                ຄ່າເລີ່ມຕົ້ນ: admin
              </span>
            </div>
            <div className="relative">
              <input
                id="admin-login-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="ປ້ອນລະຫັດຜ່ານ..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                required
                className="w-full px-4 py-2.5 pr-11 text-sm bg-neutral-50 rounded-2xl border border-neutral-200 focus:border-pink-500 focus:bg-white outline-hidden transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                title={showPassword ? 'ເຊື່ອງລະຫັດ' : 'ສະແດງລະຫັດ'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center gap-2.5 text-xs text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px]">
              ການເຂົ້າສູ່ລະບົບທຸກຄັ້ງຈະຖືກບັນທຶກ Audit Log ເພື່ອຄວາມປອດໄພຂອງຮ້ານຄ້າ
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-2xl transition-colors cursor-pointer"
            >
              ຍົກເລີກ / ກັບໜ້າຮ້ານ
            </button>
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isSubmitting || !gmail.trim() || !password.trim()}
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 active:scale-98 rounded-2xl shadow-md shadow-pink-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>ກຳລັງກວດສອບ...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ເຂົ້າສູ່ລະບົບ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
