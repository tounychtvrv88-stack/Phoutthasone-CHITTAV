import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { NyStoreLogo } from '../NyStoreLogo';

interface AdminLoginPortalProps {
  onReturnToShop: () => void;
}

export const AdminLoginPortal: React.FC<AdminLoginPortalProps> = ({ onReturnToShop }) => {
  const { loginAdmin, storeSettings } = useStore();
  const [gmail, setGmail] = useState('touny.chtvrv88@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setTimeout(() => {
      const result = loginAdmin(gmail.trim(), password.trim());
      setIsSubmitting(false);
      if (!result.success) {
        setErrorMsg(result.message || 'ອີເມວ Gmail ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
      }
    }, 250);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
        {/* Portal Header */}
        <div className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-pink-950 text-white p-8 relative">
          <button
            type="button"
            onClick={onReturnToShop}
            className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ກັບໜ້າຮ້ານຄ້າ</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <NyStoreLogo variant="icon" size="lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-neutral-900 border border-pink-400 flex items-center justify-center text-pink-400 shadow-md">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-pink-300">
                  {storeSettings.storeName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-500/30 text-pink-200 border border-pink-400/30 font-bold">
                  Direct Back-Office Link
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mt-0.5">
                ປະຕູເຂົ້າສູ່ລະບົບຫຼັງບ້ານ
              </h1>
            </div>
          </div>

          <p className="text-xs text-neutral-300/85 mt-3 leading-relaxed">
            ທ່ານກຳລັງເຂົ້າສູ່ລະບົບຈັດການຫຼັງບ້ານ (Back-Office OMS). ກະລຸນາເຂົ້າສູ່ລະບົບດ້ວຍບັນຊີ Gmail ທີ່ໄດ້ຮັບອະນຸຍາດເທົ່ານັ້ນ.
          </p>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-pink-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ລະບົບເຊື່ອມຕໍ່ຂໍ້ມູນສິນຄ້າ, ສະຕັອກ, ແລະ ຄຳສັ່ງຊື້ແບບ Real-Time</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <span className="font-bold">ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ: </span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Admin Gmail Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700">
              ບັນຊີ Gmail ຜູ້ດູແລລະບົບ (Admin Gmail):
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="portal-gmail-input"
                type="email"
                required
                autoComplete="email"
                placeholder="ປ້ອນອີເມວ Gmail ເຊັ່ນ: touny.chtvrv88@gmail.com"
                value={gmail}
                onChange={(e) => {
                  setGmail(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full pl-11 pr-4 py-3 text-sm bg-neutral-50 rounded-2xl border border-neutral-200 focus:border-pink-500 focus:bg-white outline-hidden transition-all font-medium text-neutral-900"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              ຮອງຮັບບັນຊີ Gmail ທີ່ລົງທະບຽນເປັນ Admin (ເຊັ່ນ: <span className="font-semibold text-neutral-600">touny.chtvrv88@gmail.com</span>)
            </p>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-neutral-700">
                ລະຫັດຜ່ານ (Password):
              </label>
              <span className="text-[11px] text-pink-600 font-medium">
                ຄ່າເລີ່ມຕົ້ນ: admin
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="portal-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="ປ້ອນລະຫັດຜ່ານ..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                required
                className="w-full pl-11 pr-12 py-3 text-sm bg-neutral-50 rounded-2xl border border-neutral-200 focus:border-pink-500 focus:bg-white outline-hidden transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1.5 cursor-pointer"
                title={showPassword ? 'ເຊື່ອງລະຫັດ' : 'ສະແດງລະຫັດ'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Real-time Data Sync Notice */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-start gap-3 text-xs text-neutral-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-neutral-800">
                ລະບົບເຊື່ອມຕໍ່ຂໍ້ມູນແບບ Real-Time
              </div>
              <div className="text-[11px] text-neutral-500 leading-normal">
                ທຸກການແກ້ໄຂສະຕັອກ, ເພີ່ມສິນຄ້າ, ແລະ ຈັດການອໍເດີຈະເຊື່ອມຕໍ່ກັບໜ້າຮ້ານຄ້າທັນທີ ທັງໃນໜ້າຕ່າງດຽວກັນ ແລະ ຕ່າງແທັບ.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onReturnToShop}
              className="w-full sm:w-auto flex-1 py-3 px-4 text-xs sm:text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-2xl transition-colors cursor-pointer text-center"
            >
              ← ກັບໄປໜ້າຮ້ານຄ້າ
            </button>
            <button
              id="portal-login-submit-btn"
              type="submit"
              disabled={isSubmitting || !gmail.trim() || !password.trim()}
              className="w-full sm:w-auto flex-1 py-3 px-6 text-xs sm:text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 active:scale-98 rounded-2xl shadow-md shadow-pink-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>ກຳລັງເຂົ້າສູ່ລະບົບ...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ເຂົ້າສູ່ລະບົບຫຼັງບ້ານ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
