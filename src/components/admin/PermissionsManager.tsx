import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  UserCheck,
  AlertCircle,
  X,
  Lock,
  Eye,
  KeyRound,
  Check,
  Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StaffMember, StaffRole, PermissionKey } from '../../types';
import { ROLE_CONFIGS, PERMISSION_CONFIGS } from '../../data/initialData';

export const PermissionsManager: React.FC = () => {
  const {
    staffList,
    currentStaffId,
    setCurrentStaffId,
    currentStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleStaffStatus
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  // Filter staff
  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const permissionKeys = Object.keys(PERMISSION_CONFIGS) as PermissionKey[];

  return (
    <div className="space-y-6">
      {/* 1. Header & Current Operator Switcher */}
      <div className="bg-linear-to-r from-pink-50 via-white to-purple-50 rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black text-neutral-900">
                ຈັດການສິດ & ບັນຊີພະນັກງານ (Permissions & Roles)
              </h2>
            </div>
            <p className="text-xs text-neutral-500">
              ກຳນົດສິດການເຂົ້າເຖິງຂໍ້ມູນ (RBAC), ຈັດການບັນຊີຜູ້ດູແລ ແລະ ຄວບຄຸມຄວາມປອດໄພລະບົບ
            </p>
          </div>

          {/* Current Operator Badge & Quick Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 bg-white/90 p-2.5 rounded-2xl border border-pink-200/80 shadow-xs">
            <div className="flex items-center gap-2 pr-2 border-r border-pink-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-neutral-500 font-medium">ຜູ້ໃຊ້ງານປະຈຸບັນ:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${currentStaff.avatarColor} flex items-center justify-center text-xs font-bold`}>
                {currentStaff.name.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-neutral-900 flex items-center gap-1">
                  {currentStaff.name}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${ROLE_CONFIGS[currentStaff.role].bg} ${ROLE_CONFIGS[currentStaff.role].color}`}>
                    {currentStaff.roleTitle}
                  </span>
                </div>
              </div>
            </div>
            {/* Quick Switch Dropdown */}
            <select
              value={currentStaffId}
              onChange={(e) => setCurrentStaffId(e.target.value)}
              className="text-xs font-semibold px-2 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-pink-300 outline-hidden cursor-pointer ml-1"
              title="ສັບປ່ຽນບັນຊີເພື່ອທົດສອບສິດ"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  ສັບປ່ຽນ: {s.name} ({ROLE_CONFIGS[s.role]?.title.split('(')[0].trim()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roles Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {(Object.entries(ROLE_CONFIGS) as [StaffRole, typeof ROLE_CONFIGS[StaffRole]][]).map(([roleKey, cfg]) => {
            const count = staffList.filter((s) => s.role === roleKey).length;
            return (
              <div
                key={roleKey}
                onClick={() => setRoleFilter(roleFilter === roleKey ? 'all' : roleKey)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  roleFilter === roleKey
                    ? `${cfg.bg} ${cfg.border} ring-2 ring-pink-400 shadow-xs`
                    : 'bg-white hover:bg-neutral-50 border-neutral-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                    {cfg.title.split('(')[0].trim()}
                  </span>
                  <span className="text-xs font-black text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {count} ທ່ານ
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2">
                  {cfg.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-pink-100 shadow-xs">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຊື່ພະນັກງານ, ເບີໂທ, ອີເມວ ຫຼື ຕຳແໜ່ງ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 focus:border-pink-500 outline-hidden bg-neutral-50/50"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white font-medium text-neutral-700 outline-hidden cursor-pointer"
          >
            <option value="all">ທຸກຕຳແໜ່ງ ({staffList.length})</option>
            <option value="super_admin">Super Admin</option>
            <option value="order_manager">Order Manager</option>
            <option value="inventory_manager">Inventory Manager</option>
            <option value="support_admin">Customer Support</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showMatrix
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{showMatrix ? 'ເຊື່ອງຕາຕະລາງສິດ' : 'ເບິ່ງຕາຕະລາງສິດ (Matrix)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingStaff(true)}
            className="px-4 py-2 text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>ເພີ່ມພະນັກງານໃໝ່</span>
          </button>
        </div>
      </div>

      {/* 3. Role & Permission Matrix (Expandable) */}
      {showMatrix && (
        <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-pink-500" />
                <span>ຕາຕະລາງສິດທັງໝົດຕາມບົດບາດ (Role & Permissions Matrix)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                ລາຍລະອຽດສິດທັງ 8 ດ້ານ ທີ່ຖືກກຳນົດຕາມແຕ່ລະບົດບາດ
              </p>
            </div>
            <button
              onClick={() => setShowMatrix(false)}
              className="text-xs text-neutral-400 hover:text-neutral-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold">
                  <th className="p-3">ສິດການເຂົ້າເຖິງ (Permission)</th>
                  <th className="p-3">ໂມດູນ</th>
                  <th className="p-3 text-center">Super Admin</th>
                  <th className="p-3 text-center">Order Manager</th>
                  <th className="p-3 text-center">Inventory Manager</th>
                  <th className="p-3 text-center">Customer Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {permissionKeys.map((key) => {
                  const perm = PERMISSION_CONFIGS[key];
                  return (
                    <tr key={key} className="hover:bg-pink-50/20">
                      <td className="p-3 font-medium text-neutral-800">
                        <div>{perm.label}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">{perm.description}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-semibold text-[10px]">
                          {perm.module}
                        </span>
                      </td>
                      {(['super_admin', 'order_manager', 'inventory_manager', 'support_admin'] as StaffRole[]).map((r) => {
                        const hasPerm = ROLE_CONFIGS[r].defaultPermissions[key];
                        return (
                          <td key={r} className="p-3 text-center">
                            {hasPerm ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="w-3.5 h-3.5 font-bold" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-300">
                                <X className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Staff Members Table */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-neutral-600 font-bold">
                <th className="p-4">ພະນັກງານ</th>
                <th className="p-4">ຕຳແໜ່ງ & ບົດບາດ</th>
                <th className="p-4">ຂໍ້ມູນຕິດຕໍ່</th>
                <th className="p-4">ສິດທັງໝົດ</th>
                <th className="p-4">ສະຖານະ</th>
                <th className="p-4 text-center">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                    ບໍ່ພົບພະນັກງານຕາມເງື່ອນໄຂທີ່ຄົ້ນຫາ
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const roleCfg = ROLE_CONFIGS[staff.role] || ROLE_CONFIGS.support_admin;
                  const activePermCount = Object.values(staff.permissions).filter(Boolean).length;
                  const totalPermCount = Object.keys(staff.permissions).length;
                  const isCurrent = staff.id === currentStaffId;

                  return (
                    <tr
                      key={staff.id}
                      className={`hover:bg-pink-50/20 transition-colors ${
                        isCurrent ? 'bg-pink-50/30' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${staff.avatarColor} flex items-center justify-center text-sm font-bold shadow-xs shrink-0`}
                          >
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                              <span>{staff.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-700 font-semibold">
                                  ທ່ານ
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">
                              ID: {staff.id} • ເຂົ້າໃຊ້: {staff.lastActive}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4 align-top">
                        <span
                          className={`inline-block text-xs font-bold px-2.5 py-1 rounded-xl border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}
                        >
                          {staff.roleTitle}
                        </span>
                        <div className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                          {roleCfg.description}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 align-top">
                        <div className="font-semibold text-neutral-800">{staff.phone}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{staff.email}</div>
                      </td>

                      {/* Permissions Granted */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="font-bold text-neutral-800">
                            {activePermCount} / {totalPermCount} ສິດ
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            ({Math.round((activePermCount / totalPermCount) * 100)}%)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {permissionKeys.map((pKey) => {
                            const isAllowed = staff.permissions[pKey];
                            return (
                              <span
                                key={pKey}
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${
                                  isAllowed
                                    ? 'bg-pink-50 text-pink-700 border border-pink-100'
                                    : 'bg-neutral-100 text-neutral-300 line-through'
                                }`}
                                title={PERMISSION_CONFIGS[pKey].description}
                              >
                                {PERMISSION_CONFIGS[pKey].label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4 align-top">
                        <button
                          type="button"
                          onClick={() => toggleStaffStatus(staff.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            staff.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title="ກົດເພື່ອປ່ຽນສະຖານະ ໃຊ້ງານ/ລະງັບ"
                        >
                          {staff.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ໃຊ້ງານປົກກະຕິ</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>ລະງັບການໃຊ້ງານ</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingStaff(staff)}
                            className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-pink-50 hover:border-pink-200 text-neutral-600 hover:text-pink-600 transition-colors cursor-pointer"
                            title="ແກ້ໄຂຂໍ້ມູນ ແລະ ສິດ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {staff.id !== 'staff-001' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບັນຊີພະນັກງານ "${staff.name}"?`)) {
                                  deleteStaff(staff.id);
                                }
                              }}
                              className="p-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-neutral-600 hover:text-rose-600 transition-colors cursor-pointer"
                              title="ລຶບພະນັກງານ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add / Edit Staff Modal */}
      {(isAddingStaff || editingStaff) && (
        <StaffFormModal
          staff={editingStaff}
          onClose={() => {
            setIsAddingStaff(false);
            setEditingStaff(null);
          }}
          onSave={(staffData) => {
            if (editingStaff) {
              updateStaff({ ...editingStaff, ...staffData });
            } else {
              addStaff(staffData);
            }
            setIsAddingStaff(false);
            setEditingStaff(null);
          }}
        />
      )}
    </div>
  );
};

// Modal for Adding or Editing Staff & Customizing Permissions
interface StaffFormModalProps {
  staff: StaffMember | null;
  onClose: () => void;
  onSave: (data: Omit<StaffMember, 'id' | 'createdAt' | 'lastActive'>) => void;
}

const StaffFormModal: React.FC<StaffFormModalProps> = ({ staff, onClose, onSave }) => {
  const [name, setName] = useState(staff?.name || '');
  const [role, setRole] = useState<StaffRole>(staff?.role || 'order_manager');
  const [phone, setPhone] = useState(staff?.phone || '020 ');
  const [email, setEmail] = useState(staff?.email || '');
  const [password, setPassword] = useState(staff?.password || 'admin');
  const [status, setStatus] = useState<'active' | 'suspended'>(staff?.status || 'active');
  const [avatarColor, setAvatarColor] = useState(staff?.avatarColor || 'bg-blue-500 text-white');

  // Permissions state
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>(
    staff?.permissions || ROLE_CONFIGS[staff?.role || 'order_manager'].defaultPermissions
  );

  // When role changes, optionally apply default permissions
  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    setPermissions(ROLE_CONFIGS[newRole].defaultPermissions);
  };

  const handleTogglePermission = (key: PermissionKey) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      role,
      roleTitle: ROLE_CONFIGS[role].title.split('(')[0].trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: password.trim() || 'admin',
      status,
      permissions,
      avatarColor
    });
  };

  const permissionKeys = Object.keys(PERMISSION_CONFIGS) as PermissionKey[];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">
              {staff ? 'ແກ້ໄຂຂໍ້ມູນ & ສິດພະນັກງານ' : 'ເພີ່ມບັນຊີພະນັກງານໃໝ່'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-neutral-700">ຊື່ ແລະ ນາມສະກຸນ *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ເຊັ່ນ: ທ້າວ ຄຳພອນ ໄຊຍະວົງ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 outline-hidden font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">ບົດບາດ / ຕຳແໜ່ງ (Role) *</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                className="w-full px-3 py-2.5 rounded-xl border border-pink-200 bg-white font-semibold"
              >
                <option value="super_admin">Super Admin (ຜູ້ດູແລສູງສຸດ)</option>
                <option value="order_manager">Order Manager (ຈັດການອໍເດີ້)</option>
                <option value="inventory_manager">Inventory Manager (ຄັງສິນຄ້າ)</option>
                <option value="support_admin">Customer Support (ບໍລິການລູກຄ້າ)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">ສະຖານະການໃຊ້ງານ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'suspended')}
                className="w-full px-3 py-2.5 rounded-xl border border-pink-200 bg-white"
              >
                <option value="active">✓ ໃຊ້ງານປົກກະຕິ (Active)</option>
                <option value="suspended">✗ ລະງັບຊົ່ວຄາວ (Suspended)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-neutral-700">ເບີໂທລະສັບ *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="020 xxxxxxxx"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">ອີເມວ</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nystore.la"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">
                ລະຫັດຜ່ານເຂົ້າສູ່ລະບົບ *
              </label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ຄ່າເລີ່ມຕົ້ນ: admin"
                className="w-full px-3.5 py-2 rounded-xl border border-pink-200 outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Granular Permissions Checkboxes */}
          <div className="pt-2 border-t border-pink-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-pink-500" />
                <span>ກຳນົດສິດການເຂົ້າເຖິງສະເພາະ (Granular Permissions):</span>
              </label>
              <button
                type="button"
                onClick={() => setPermissions(ROLE_CONFIGS[role].defaultPermissions)}
                className="text-[11px] text-pink-600 hover:text-pink-700 font-semibold cursor-pointer"
              >
                ຣີເຊັດຕາມຄ່າເລີ່ມຕົ້ນຂອງບົດບາດ
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-pink-50/40 p-3 rounded-2xl border border-pink-100">
              {permissionKeys.map((pKey) => {
                const pConfig = PERMISSION_CONFIGS[pKey];
                const isChecked = !!permissions[pKey];

                return (
                  <label
                    key={pKey}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'bg-white border-pink-300 shadow-2xs'
                        : 'bg-white/50 border-neutral-200 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(pKey)}
                      className="mt-0.5 rounded text-pink-600 focus:ring-pink-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-neutral-800 flex items-center justify-between">
                        <span>{pConfig.label}</span>
                        <span className="text-[9px] px-1 rounded bg-neutral-100 text-neutral-500">
                          {pConfig.module}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5 leading-tight">
                        {pConfig.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-neutral-200 font-semibold cursor-pointer"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-md shadow-pink-200 cursor-pointer"
            >
              ບັນທຶກຂໍ້ມູນ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
