import {
  Product,
  Order,
  StoreSettings,
  StaffRole,
  PermissionKey,
  StaffMember,
  SystemServiceHealth,
  SystemAuditLog
} from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'NY Beauty SHop',
  storePhone: '020 2803 9599',
  whatsappNumber: '8562028039599',
  facebookPageName: 'NY Beauty SHop',
  facebookUrl: 'https://www.facebook.com/share/1B59iN8jJG/?mibextid=wwXIfr',
  bcelAccountName: 'NY BEAUTY SHOP (Phoutthasone Chittavoravong MS)',
  bcelAccountNumber: '010-12-00-01114167-001',
  bcelQrImage: '/bcel-qr.jpg',
  shippingRates: {
    Anusith: 0,
    Hal: 0,
    Mixay: 0
  },
  whatsappApi: {
    enabled: true,
    provider: 'meta_cloud_api',
    notifyNumber: '8562028039599',
    phoneNumberId: '',
    accessToken: '',
    webhookUrl: ''
  }
};

export const CATEGORIES = [
  'ທັງໝົດ',
  'ບຳລຸງຜິວ',
  'ເຄື່ອງສຳອາງ',
  'ເສື້ອຜ້າແຟຊັ່ນ',
  'ກະເປົາ & ອຸປະກອນ'
];

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; step: number }
> = {
  pending_payment: {
    label: 'ລໍຖ້າຊຳລະເງິນ',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    step: 1
  },
  paid: {
    label: 'ຊຳລະແລ້ວ',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    step: 2
  },
  packing: {
    label: 'ກຳລັງແພັກ',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    step: 3
  },
  shipped: {
    label: 'ຈັດສົ່ງແລ້ວ',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    step: 4
  },
  completed: {
    label: 'ສຳເລັດ',
    color: 'text-pink-700',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    step: 5
  },
  cancelled: {
    label: 'ຍົກເລີກ',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    step: 0
  }
};

export const SHIPPING_PROVIDERS_CONFIG = {
  Anusith: {
    name: 'Anusith Express',
    laoName: 'ອານຸສິດ ຂົນສົ່ງດ່ວນ',
    rate: 0,
    estimate: '1-2 ວັນ',
    color: 'bg-blue-600',
    desc: 'ຈັດສົ່ງທົ່ວປະເທດ ວ່ອງໄວ ສະດວກ'
  },
  Hal: {
    name: 'HAL Logistics',
    laoName: 'ຮຸ່ງອາລຸນ ຂົນສົ່ງດ່ວນ',
    rate: 0,
    estimate: '1-2 ວັນ',
    color: 'bg-orange-500',
    desc: 'ມາດຕະຖານສາກົນ ສາຂາຄອບຄຸມຫຼາຍທີ່ສຸດ'
  },
  Mixay: {
    name: 'Mixay Express',
    laoName: 'ມີໄຊ ຂົນສົ່ງດ່ວນ',
    rate: 0,
    estimate: '2-3 ວັນ',
    color: 'bg-emerald-600',
    desc: 'ລາຄາປະຢັດ ຈັດສົ່ງຮອດມືປອດໄພ'
  }
};

// =================== PERMISSIONS & ROLES CONFIG ===================
export const PERMISSION_CONFIGS: Record<
  PermissionKey,
  { label: string; description: string; module: 'OMS' | 'INVENTORY' | 'FINANCE' | 'SYSTEM' }
> = {
  orders_view: {
    label: 'ເບິ່ງລາຍການຄຳສັ່ງຊື້',
    description: 'ສາມາດເຂົ້າເບິ່ງລາຍການອໍເດີ້ທັງໝົດ, ສະລິບໂອນເງິນ ແລະ ຂໍ້ມູນລູກຄ້າ',
    module: 'OMS'
  },
  orders_update: {
    label: 'ອັບເດດສະຖານະ & ເລກ Tracking',
    description: 'ສາມາດປ່ຽນສະຖານະອໍເດີ້, ໃສ່ເລກພັດສະດຸ ແລະ ແຈ້ງ WhatsApp',
    module: 'OMS'
  },
  inventory_view: {
    label: 'ເບິ່ງຄັງສິນຄ້າ & ສະຕັອກ',
    description: 'ສາມາດກວດສອບຈຳນວນຄົງເຫຼືອ ແລະ ລາຍການສິນຄ້າ',
    module: 'INVENTORY'
  },
  inventory_edit: {
    label: 'ເພີ່ມ/ແກ້ໄຂສິນຄ້າ & ເຕີມສະຕັອກ',
    description: 'ສາມາດເພີ່ມສິນຄ້າໃໝ່, ແກ້ໄຂລາຄາ, ປັບປ່ຽນຮູບພາບ ແລະ ຕື່ມສະຕັອກ',
    module: 'INVENTORY'
  },
  finance_view: {
    label: 'ເບິ່ງຍອດເງິນ & ລາຍຮັບ',
    description: 'ສາມາດກວດເບິ່ງຍອດຂາຍລວມ, ຍອດເງິນທີ່ໄດ້ຮັບ ແລະ ສະຖິຕິການຂາຍ',
    module: 'FINANCE'
  },
  finance_manage: {
    label: 'ຕັ້ງຄ່າບັນຊີ BCEL One & ຄ່າຂົນສົ່ງ',
    description: 'ສາມາດແກ້ໄຂເລກບັນຊີ BCEL, ອັບໂຫຼດ QR ໃໝ່ ແລະ ປັບລາຄາຂົນສົ່ງ',
    module: 'FINANCE'
  },
  staff_manage: {
    label: 'ຈັດການສິດ & ບັນຊີພະນັກງານ',
    description: 'ສາມາດເພີ່ມ, ແກ້ໄຂ, ປິດການໃຊ້ງານ ແລະ ກຳນົດສິດໃຫ້ພະນັກງານ',
    module: 'SYSTEM'
  },
  system_monitor: {
    label: 'ກວດສອບສະຖານະລະບົບ & Logs',
    description: 'ສາມາດເຂົ້າເບິ່ງສະຖານະເຊີບເວີ, ທົດສອບລະບົບ ແລະ ກວດສອບ Audit Logs',
    module: 'SYSTEM'
  }
};

export const ROLE_CONFIGS: Record<
  StaffRole,
  {
    title: string;
    description: string;
    color: string;
    bg: string;
    border: string;
    defaultPermissions: Record<PermissionKey, boolean>;
  }
> = {
  super_admin: {
    title: 'ເຈົ້າຂອງຮ້ານ / ຜູ້ດູແລສູງສຸດ (Super Admin)',
    description: 'ມີສິດຄົບທຸກຢ່າງໃນລະບົບ ສາມາດຄວບຄຸມການເງິນ, ສິນຄ້າ, ອໍເດີ້ ແລະ ພະນັກງານ',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    defaultPermissions: {
      orders_view: true,
      orders_update: true,
      inventory_view: true,
      inventory_edit: true,
      finance_view: true,
      finance_manage: true,
      staff_manage: true,
      system_monitor: true
    }
  },
  order_manager: {
    title: 'ຫົວໜ້າຈັດການຄຳສັ່ງຊື້ (Order Manager)',
    description: 'ຈັດການອໍເດີ້ລູກຄ້າ, ກວດສະລິບ BCEL, ໃສ່ເລກ Tracking ແລະ ແຈ້ງຂົນສົ່ງ',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    defaultPermissions: {
      orders_view: true,
      orders_update: true,
      inventory_view: true,
      inventory_edit: false,
      finance_view: true,
      finance_manage: false,
      staff_manage: false,
      system_monitor: true
    }
  },
  inventory_manager: {
    title: 'ພະນັກງານຄັງສິນຄ້າ (Inventory Manager)',
    description: 'ດູແລສະຕັອກສິນຄ້າ, ເຕີມສະຕັອກທີ່ໃກ້ໝົດ, ເພີ່ມສິນຄ້າໃໝ່ ແລະ ກວດນັບ',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    defaultPermissions: {
      orders_view: true,
      orders_update: false,
      inventory_view: true,
      inventory_edit: true,
      finance_view: false,
      finance_manage: false,
      staff_manage: false,
      system_monitor: true
    }
  },
  support_admin: {
    title: 'ພະນັກງານບໍລິການລູກຄ້າ (Customer Support)',
    description: 'ຕິດຕາມສະຖານະພັດສະດຸ, ຕອບແຊັດ WhatsApp ແລະ ຊ່ວຍເຫຼືອລູກຄ້າ',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    defaultPermissions: {
      orders_view: true,
      orders_update: false,
      inventory_view: true,
      inventory_edit: false,
      finance_view: false,
      finance_manage: false,
      staff_manage: false,
      system_monitor: false
    }
  }
};

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-001',
    name: 'ນາງ ຕຸກຕາ ຈັນທະວົງ (Ny)',
    role: 'super_admin',
    roleTitle: 'ເຈົ້າຂອງຮ້ານ & ຜູ້ດູແລສູງສຸດ',
    phone: '020 55667788',
    email: 'touny.chtvrv88@gmail.com',
    password: 'admin',
    status: 'active',
    permissions: {
      orders_view: true,
      orders_update: true,
      inventory_view: true,
      inventory_edit: true,
      finance_view: true,
      finance_manage: true,
      staff_manage: true,
      system_monitor: true
    },
    createdAt: '2025-01-01 08:00',
    lastActive: 'ປະຈຸບັນ (Online)',
    avatarColor: 'bg-pink-500 text-white'
  },
  {
    id: 'staff-002',
    name: 'ທ້າວ ສົມສັກ ແກ້ວມະນີ',
    role: 'order_manager',
    roleTitle: 'ຫົວໜ້າຈັດການອໍເດີ້ & ຂົນສົ່ງ',
    phone: '020 99881122',
    email: 'somsack.k@nystore.la',
    password: 'admin',
    status: 'active',
    permissions: {
      orders_view: true,
      orders_update: true,
      inventory_view: true,
      inventory_edit: false,
      finance_view: true,
      finance_manage: false,
      staff_manage: false,
      system_monitor: true
    },
    createdAt: '2025-01-15 09:30',
    lastActive: '10 ນາທີກ່ອນ',
    avatarColor: 'bg-blue-500 text-white'
  },
  {
    id: 'staff-003',
    name: 'ນາງ ມະນີວອນ ພົມມະຈັນ',
    role: 'inventory_manager',
    roleTitle: 'ພະນັກງານຈັດການຄັງສິນຄ້າ',
    phone: '020 77443322',
    email: 'manivone.p@nystore.la',
    password: 'admin',
    status: 'active',
    permissions: {
      orders_view: true,
      orders_update: false,
      inventory_view: true,
      inventory_edit: true,
      finance_view: false,
      finance_manage: false,
      staff_manage: false,
      system_monitor: true
    },
    createdAt: '2025-02-01 10:15',
    lastActive: '35 ນາທີກ່ອນ',
    avatarColor: 'bg-amber-500 text-white'
  },
  {
    id: 'staff-004',
    name: 'ນາງ ວິໄລພອນ ໄຊຍະສິດ',
    role: 'support_admin',
    roleTitle: 'ພະນັກງານບໍລິການລູກຄ້າ WhatsApp',
    phone: '020 54321098',
    email: 'vilaiphone.s@nystore.la',
    password: 'admin',
    status: 'active',
    permissions: {
      orders_view: true,
      orders_update: false,
      inventory_view: true,
      inventory_edit: false,
      finance_view: false,
      finance_manage: false,
      staff_manage: false,
      system_monitor: false
    },
    createdAt: '2025-02-10 14:00',
    lastActive: '2 ຊົ່ວໂມງກ່ອນ',
    avatarColor: 'bg-emerald-500 text-white'
  }
];

export const INITIAL_SERVICES_HEALTH: SystemServiceHealth[] = [
  {
    id: 'srv-web',
    name: 'Web Application & Storefront',
    nameLao: 'ລະບົບໜ້າຮ້ານຄ້າ & ແອັບພລິເຄຊັນ',
    status: 'healthy',
    latencyMs: 14,
    lastChecked: 'ຫາກໍ່ກວດສອບ',
    description: 'React 18 + Vite SPA Single-Page Architecture ເຮັດວຽກປົກກະຕິ'
  },
  {
    id: 'srv-db',
    name: 'Persistent Local Storage Engine',
    nameLao: 'ຖານຂໍ້ມູນຄວາມຈຳ & Storage Engine',
    status: 'healthy',
    latencyMs: 2,
    lastChecked: 'ຫາກໍ່ກວດສອບ',
    description: 'ລະບົບບັນທຶກຄຳສັ່ງຊື້, ສະຕັອກສິນຄ້າ ແລະ ການຕັ້ງຄ່າທ້ອງຖິ່ນພ້ອມໃຊ້ງານ'
  },
  {
    id: 'srv-bcel',
    name: 'BCEL OnePay QR Verification Gateway',
    nameLao: 'ປະຕູເຊື່ອມຕໍ່ຊຳລະເງິນ BCEL OnePay',
    status: 'healthy',
    latencyMs: 42,
    lastChecked: 'ຫາກໍ່ກວດສອບ',
    description: 'ສ້າງ QR ລະຫັດຊຳລະ ແລະ ອັບໂຫຼດສະລິບກວດສອບພ້ອມໃຊ້ງານ'
  },
  {
    id: 'srv-logistics',
    name: 'Logistics Tracking Bridge (Anusith/HAL/Mixay)',
    nameLao: 'ລະບົບເຊື່ອມຕໍ່ຕິດຕາມເລກພັດສະດຸຂົນສົ່ງ',
    status: 'healthy',
    latencyMs: 38,
    lastChecked: 'ຫາກໍ່ກວດສອບ',
    description: 'ຮອງຮັບອານຸສິດ (Anusith), ຮຸ່ງອາລຸນ (HAL), ແລະ ມີໄຊ (Mixay) ດ່ວນ'
  },
  {
    id: 'srv-print',
    name: 'Receipt & Packing Slip Print Engine',
    nameLao: 'ລະບົບພິມໃບບິນ & ດາວໂຫຼດ PDF',
    status: 'healthy',
    latencyMs: 8,
    lastChecked: 'ຫາກໍ່ກວດສອບ',
    description: 'ຮອງຮັບການພິມໃບບິນຮັບເງິນມາດຕະຖານພາສາລາວ ແລະ Save as PDF'
  },
  {
    id: 'srv-whatsapp',
    name: 'WhatsApp Direct Chat Dispatcher',
    nameLao: 'ລະບົບແຈ້ງເຕືອນລູກຄ້າຜ່ານ WhatsApp',
    status: 'healthy',
    latencyMs: 19,
    lastChecked: 'ຫາກໍ່ກວດສອບ',
    description: 'ສົ່ງຂໍ້ຄວາມອັດຕະໂນມັດພ້ອມເລກອໍເດີ້ ແລະ ລິ້ງກວດສອບພັດສະດຸ'
  }
];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2025-05-20 15:45:10',
    operator: 'ນາງ ຕຸກຕາ ຈັນທະວົງ',
    role: 'Super Admin',
    module: 'PERMISSIONS',
    action: 'ອັບເດດສິດພະນັກງານ',
    details: 'ກຳນົດສິດເພີ່ມໃຫ້ "ທ້າວ ສົມສັກ ແກ້ວມະນີ" ສາມາດກວດສອບ System Monitor ໄດ້',
    status: 'success'
  },
  {
    id: 'log-002',
    timestamp: '2025-05-20 15:30:22',
    operator: 'ທ້າວ ສົມສັກ ແກ້ວມະນີ',
    role: 'Order Manager',
    module: 'OMS',
    action: 'ປ່ຽນສະຖານະອໍເດີ້ #NY-8491',
    details: 'ອັບເດດສະຖານະຈາກ "packing" ເປັນ "shipped" ພ້ອມໃສ່ເລກ Tracking: ANU-882914',
    status: 'success'
  },
  {
    id: 'log-003',
    timestamp: '2025-05-20 14:12:05',
    operator: 'ນາງ ມະນີວອນ ພົມມະຈັນ',
    role: 'Inventory Manager',
    module: 'INVENTORY',
    action: 'ເຕີມສະຕັອກສິນຄ້າ',
    details: 'ເຕີມສະຕັອກສິນຄ້າ "ເຊຣັ່ມບຳລຸງຜິວໜ້າ Rose Glow Radiance Serum" ເພີ່ມ +20 ຊິ້ນ',
    status: 'success'
  },
  {
    id: 'log-004',
    timestamp: '2025-05-20 12:00:00',
    operator: 'System Automator',
    role: 'System',
    module: 'SYSTEM',
    action: 'ກວດສອບສຸຂະພາບລະບົບປະຈຳວັນ',
    details: 'ກວດເຊັກ 6 ໂມດູນຫຼັກ: All Systems Operational (100% Uptime)',
    status: 'info'
  },
  {
    id: 'log-005',
    timestamp: '2025-05-20 10:20:18',
    operator: 'ນາງ ຕຸກຕາ ຈັນທະວົງ',
    role: 'Super Admin',
    module: 'FINANCE',
    action: 'ກວດສອບບັນຊີ BCEL One',
    details: 'ຢືນຢັນເລກບັນຊີ 160-12-00-98765432-1 ແລະ ອັດຕາຄ່າຂົນສົ່ງ',
    status: 'success'
  },
  {
    id: 'log-006',
    timestamp: '2025-05-20 09:15:33',
    operator: 'ທ້າວ ສົມສັກ ແກ້ວມະນີ',
    role: 'Order Manager',
    module: 'OMS',
    action: 'ພິມໃບບິນຮັບເງິນ #NY-9041',
    details: 'ດາວໂຫຼດໃບບິນ PDF ສຳລັບລູກຄ້າ: ນາງ ມະນີວອນ ຄຳສະຫວັນ',
    status: 'info'
  }
];

