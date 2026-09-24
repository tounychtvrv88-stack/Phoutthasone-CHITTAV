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

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'ເຊຣັ່ມບຳລຸງຜິວໜ້າ Rose Glow Radiance Serum',
    category: 'ບຳລຸງຜິວ',
    price: 185000,
    costPrice: 115000,
    originalPrice: 240000,
    description: 'ເຊຣັ່ມສານສະກັດຈາກດອກກຸຫຼາບ ແລະ Niacinamide ຊ່ວຍໃຫ້ຜິວກະຈ່າງໃສ ຊຸ່ມຊື່ນ ຫຼຸດຮອຍດ່າງດຳ ແລະ ກະຊັບຮູຂຸມຂົນ ສູດອ່ອນໂຍນເໝາະກັບທຸກສະພາບຜິວ.',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-5936d538ff09?auto=format&fit=crop&w=800&q=80'
    ],
    options: [
      {
        name: 'ປະລິມານ',
        values: ['30ml (ຂວດມາດຕະຖານ)', '50ml (ຂະໜາດສຸດຄຸ້ມ)']
      },
      {
        name: 'ສູດບຳລຸງ',
        values: ['ສູດ Brightening (ຜິວຂາວໃສ)', 'ສູດ Hydration (ເພີ່ມຄວາມຊຸ່ມຊື່ນ)']
      }
    ],
    stock: 18,
    lowStockThreshold: 5,
    salesCount: 42,
    isPromo: true
  },
  {
    id: 'prod-002',
    name: 'ລິບສະຕິກເນື້ອແປ້ງ Soft Velvet Mousse Lip',
    category: 'ເຄື່ອງສຳອາງ',
    price: 95000,
    costPrice: 55000,
    originalPrice: 125000,
    description: 'ລິບມູສເນື້ອແປ້ງນຸ້ມລະມຸນ ບາງເບົາສະບາຍປາກ ຕິດທົນນານຕະຫຼອດມື້ ໂທນສີຫວານລະມຸນ ໃຫ້ລຸກທີ່ເປັນທຳມະຊາດແບບສາວເກົາຫຼີ.',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'
    ],
    options: [
      {
        name: 'ເບີສີ',
        values: ['#01 Rose Pink (ຊົມພູກຸຫຼາບ)', '#02 Soft Peach (ພີຊລະມຸນ)', '#03 Cherry Blossom (ຊາກຸຣະ)']
      }
    ],
    stock: 4, // Low stock demo!
    lowStockThreshold: 5,
    salesCount: 68,
    isPromo: true
  },
  {
    id: 'prod-003',
    name: 'ຄຣີມກັນແດດເນື້ອໂລຊັ່ນ Pink Sunscreen SPF50+ PA++++',
    category: 'ບຳລຸງຜິວ',
    price: 145000,
    costPrice: 90000,
    originalPrice: 180000,
    description: 'ຄຣີມກັນແດດສູດບາງເບົາ ປັບສີຜິວໃຫ້ກະຈ່າງໃສຂຶ້ນ 1 ລະດັບ ບໍ່ໜຽວໜຽະ ຄວບຄຸມຄວາມມັນ ກັນນ້ຳກັນເຫື່ອ ປົກປ້ອງຜິວຈາກແສງແດດ UVA/UVB.',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
    ],
    options: [
      {
        name: 'ຂະໜາດ',
        values: ['40ml', '60ml']
      }
    ],
    stock: 22,
    lowStockThreshold: 5,
    salesCount: 35,
    isPromo: true
  },
  {
    id: 'prod-004',
    name: 'ກະເປົາສະພາຍຂ້າງ Pastel Mini Tote Bag',
    category: 'ກະເປົາ & ອຸປະກອນ',
    price: 260000,
    costPrice: 165000,
    originalPrice: 320000,
    description: 'ກະເປົາສະພາຍໜັງພຣີມຽມສັງເຄາະ ນ້ຳໜັກເບົາ ທົນທານ ດີໄຊន៍ໜ້າຮັກໂທນສີພັສເທວ ຈຸເຄື່ອງໄດ້ຫຼາຍ ເໝາະກັບການໄປທ່ຽວ ແລະ ເຮັດວຽກ.',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
    ],
    options: [
      {
        name: 'ສີກະເປົາ',
        values: ['Soft Pink (ຊົມພູອ່ອນ)', 'Cloud White (ຂາວ)', 'Lilac Cream (ມ່ວງພັສເທວ)']
      },
      {
        name: 'ຂະໜາດ',
        values: ['Mini (20cm)', 'Regular (26cm)']
      }
    ],
    stock: 3, // Low stock demo!
    lowStockThreshold: 5,
    salesCount: 19,
    isPromo: true
  },
  {
    id: 'prod-005',
    name: 'ເສື້ອກັນໜາວຄາດິແກນ Soft Knit Pastel Cardigan',
    category: 'ເສື້ອຜ້າແຟຊັ່ນ',
    price: 195000,
    costPrice: 120000,
    originalPrice: 250000,
    description: 'ເສື້ອຄາດິແກນໄໝພົມເນື້ອລະອຽດ ນຸ້ມນວນໃສ່ສະບາຍ ບໍ່ຮ້ອນອົບອ້າວ ດີໄຊໂທນສີຫວານລະມຸນ ແມັດຊ໌ງ່າຍກັບທຸກຊຸດ.',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    options: [
      {
        name: 'ຂະໜາດໄຊສ໌',
        values: ['Free Size (S - L)', 'Plus Size (XL - 2XL)']
      },
      {
        name: 'ສີ',
        values: ['Baby Pink (ຊົມພູຫວານ)', 'Beige Cream (ຄຣີມ)', 'Pastel Green (ຂຽວອ່ອນ)']
      }
    ],
    stock: 12,
    lowStockThreshold: 5,
    salesCount: 28,
    isPromo: false
  },
  {
    id: 'prod-006',
    name: 'ນ້ຳຫອມ Floral Blossom Eau De Parfum',
    category: 'ເຄື່ອງສຳອາງ',
    price: 320000,
    costPrice: 190000,
    originalPrice: 390000,
    description: 'ນ້ຳຫອມກິ່ນດອກໄມ້ນານາພັນ ໃຫ້ຄວາມຮູ້ສຶກສົດຊື່ນ ຫວານລະມຸນ ມີສະເໜ່ ຕິດທົນນານຫຼາຍກວ່າ 12 ຊົ່ວໂມງ ຕຸກແກ້ວຫລູຫລາ.',
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
    ],
    options: [
      {
        name: 'ຂະໜາດບັນຈຸ',
        values: ['50ml', '100ml (+₭80,000)']
      }
    ],
    stock: 15,
    lowStockThreshold: 5,
    salesCount: 51,
    isPromo: true
  },
  {
    id: 'prod-007',
    name: 'ແປ້ງພັບຄຸມມັນ Pink Mineral Cushion SPF40',
    category: 'ເຄື່ອງສຳອາງ',
    price: 135000,
    costPrice: 80000,
    originalPrice: 170000,
    description: 'ຄູຊັ່ນເນື້ອແມັດ ປົກປິດຮອຍສິວ ແລະ ຈຸດດ່າງດຳຢ່າງລຽບນຽນ ຄວບຄຸມຄວາມມັນຍາວນານ ບໍ່ຕົກຮ່ອງ ພ້ອມຕະລັບໂທນຊົມພູສຸດໜ້າຮັກ.',
    images: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
    ],
    options: [
      {
        name: 'ເບີສີຜິວ',
        values: ['No.21 (ຜິວຂາວ)', 'No.23 (ຜິວສອງສີ)']
      }
    ],
    stock: 2, // Low stock demo!
    lowStockThreshold: 5,
    salesCount: 39,
    isPromo: true
  },
  {
    id: 'prod-008',
    name: 'ໂລຊັ່ນບຳລຸງຜິວກາຍ Sweet Berry Body Milk',
    category: 'ບຳລຸງຜິວ',
    price: 110000,
    costPrice: 65000,
    originalPrice: 140000,
    description: 'ໂລຊັ່ນນ້ຳນົມບຳລຸງຜິວກາຍ ກິ່ນເບີຣີ່ຫວານສົດຊື່ນ ຊຶມໄວ ບໍ່ໜຽວ ຊ່ວຍໃຫ້ຜິວນຸ້ມຊຸ່ມຊື່ນ ແລະ ມີກິ່ນຫອມຕິດກາຍຕະຫຼອດມື້.',
    images: [
      'https://images.unsplash.com/photo-1608248597359-5936d538ff09?auto=format&fit=crop&w=800&q=80'
    ],
    options: [
      {
        name: 'ປະລິມານ',
        values: ['250ml', '500ml']
      }
    ],
    stock: 25,
    lowStockThreshold: 5,
    salesCount: 16,
    isPromo: false
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'NY-2026-9041',
    customerName: 'ມະນີວັນ ວົງສະຫວັນ',
    customerPhone: '02055123456',
    address: 'ບ້ານ ໂພນສະຫວ່າງ, ເມືອງ ຈັນທະບູລີ',
    province: 'ນະຄອນຫຼວງວຽງຈັນ',
    district: 'ຈັນທະບູລີ',
    shippingProvider: 'Anusith',
    trackingNumber: 'ANU-LA-9874125',
    items: [
      {
        id: 'ci-1',
        productId: 'prod-001',
        product: INITIAL_PRODUCTS[0],
        selectedOptions: { 'ປະລິມານ': '30ml (ຂວດມາດຕະຖານ)' },
        quantity: 1,
        price: 185000,
        costPrice: 115000
      }
    ],
    subtotal: 185000,
    shippingFee: 15000,
    total: 200000,
    paymentMethod: 'BCEL_ONE',
    paymentSlipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    status: 'shipped',
    createdAt: '2026-09-17 14:30',
    updatedAt: '2026-09-17 16:00',
    notes: 'ສົ່ງຊ່ວງເຊົ້າຈະດີຫຼາຍ'
  },
  {
    id: 'NY-2026-9042',
    customerName: 'ສຸກສະຫວັນ ແກ້ວມະນີ',
    customerPhone: '02099887766',
    address: 'ບ້ານ ໄຊສະຖານ, ເມືອງ ປາກເຊ',
    province: 'ຈຳປາສັກ',
    district: 'ປາກເຊ',
    shippingProvider: 'Hal',
    trackingNumber: 'HAL-PK-452109',
    items: [
      {
        id: 'ci-2',
        productId: 'prod-002',
        product: INITIAL_PRODUCTS[1],
        selectedOptions: { 'ເບີສີ': '#01 Rose Pink (ຊົມພູກຸຫຼາບ)' },
        quantity: 2,
        price: 95000,
        costPrice: 55000
      }
    ],
    subtotal: 190000,
    shippingFee: 18000,
    total: 208000,
    paymentMethod: 'BCEL_ONE',
    paymentSlipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    status: 'packing',
    createdAt: '2026-09-17 16:45',
    updatedAt: '2026-09-17 17:10'
  },
  {
    id: 'NY-2026-9043',
    customerName: 'ດາວອນ ໄຊຍະສິດ',
    customerPhone: '02077654321',
    address: 'ບ້ານ ປ່າຂາມ, ເມືອງ ຫຼວງພະບາງ',
    province: 'ຫຼວງພະບາງ',
    district: 'ຫຼວງພະບາງ',
    shippingProvider: 'Mixay',
    items: [
      {
        id: 'ci-3',
        productId: 'prod-004',
        product: INITIAL_PRODUCTS[3],
        selectedOptions: { 'ສີກະເປົາ': 'Soft Pink (ຊົມພູອ່ອນ)', 'ຂະໜາດ': 'Mini (20cm)' },
        quantity: 1,
        price: 260000,
        costPrice: 165000
      }
    ],
    subtotal: 260000,
    shippingFee: 15000,
    total: 275000,
    paymentMethod: 'BCEL_ONE',
    paymentSlipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    status: 'paid',
    createdAt: '2026-09-17 19:20',
    updatedAt: '2026-09-17 19:25'
  }
];

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

