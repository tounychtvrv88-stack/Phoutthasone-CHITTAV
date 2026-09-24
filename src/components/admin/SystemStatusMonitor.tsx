import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  QrCode,
  Truck,
  Printer,
  MessageCircle,
  HardDrive,
  Clock,
  Search,
  Filter,
  Trash2,
  Download,
  Check,
  ShieldAlert,
  Zap,
  Cpu,
  Package
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { INITIAL_SERVICES_HEALTH } from '../../data/initialData';
import { SystemServiceHealth, SystemAuditLog } from '../../types';
import { getCurrentDateTime } from '../../utils/format';

export const SystemStatusMonitor: React.FC = () => {
  const {
    orders,
    products,
    lowStockProducts,
    auditLogs,
    clearAuditLogs,
    addAuditLog,
    currentStaff
  } = useStore();

  const [services, setServices] = useState<SystemServiceHealth[]>(INITIAL_SERVICES_HEALTH);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('ຫາກໍ່ກວດສອບ');
  const [logSearch, setLogSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [isExported, setIsExported] = useState(false);

  // Calculate local storage size in bytes
  const storageMetrics = useMemo(() => {
    let totalBytes = 0;
    let itemCount = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ny_store_')) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2; // UTF-16 approximation
          itemCount++;
        }
      }
    } catch {
      totalBytes = 25000;
    }
    const usedKb = Math.max(1, Math.round(totalBytes / 1024));
    const maxQuotaKb = 5120; // 5MB standard localStorage
    const percentUsed = Math.min(100, Math.max(1, Math.round((usedKb / maxQuotaKb) * 100)));

    return {
      usedKb,
      maxQuotaKb,
      percentUsed,
      itemCount
    };
  }, [orders, products, auditLogs]);

  // Run full system diagnostic
  const handleRunDiagnostic = () => {
    setIsDiagnosing(true);

    setTimeout(() => {
      // Simulate fresh ping response
      const updated = services.map((s) => ({
        ...s,
        latencyMs: Math.floor(Math.random() * 35) + 5,
        lastChecked: 'ຫາກໍ່ກວດສອບແລ້ວ',
        status: 'healthy' as const
      }));

      setServices(updated);
      setIsDiagnosing(false);
      const now = getCurrentDateTime();
      setLastCheckTime(now);

      addAuditLog({
        operator: currentStaff.name,
        role: currentStaff.roleTitle,
        module: 'SYSTEM',
        action: 'ທົດສອບສຸຂະພາບລະບົບ (Run Diagnostic)',
        details: `ກວດເຊັກ 6 Microservices: All Healthy, Latency ສະເລ່ຍ ~18ms`,
        status: 'success'
      });
    }, 1200);
  };

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.operator.toLowerCase().includes(logSearch.toLowerCase());

    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  // Export logs as JSON file
  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ny_store_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2500);
  };

  // Service Icon Helper
  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'srv-web':
        return <Server className="w-5 h-5 text-pink-500" />;
      case 'srv-db':
        return <Database className="w-5 h-5 text-blue-500" />;
      case 'srv-bcel':
        return <QrCode className="w-5 h-5 text-rose-500" />;
      case 'srv-logistics':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'srv-print':
        return <Printer className="w-5 h-5 text-purple-500" />;
      case 'srv-whatsapp':
        return <MessageCircle className="w-5 h-5 text-emerald-500" />;
      default:
        return <Cpu className="w-5 h-5 text-neutral-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Main System Status Hero Banner */}
      <div className="bg-linear-to-r from-emerald-50 via-white to-pink-50 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                ລະບົບເຮັດວຽກປົກກະຕິ (All Systems Operational)
              </span>
              <span className="text-xs text-neutral-400">
                Uptime: 99.98%
              </span>
            </div>

            <h2 className="text-xl font-black text-neutral-900">
              ກວດສອບສະຖານະລະບົບ & ບັນທຶກການເຮັດວຽກ (System Health & Logs)
            </h2>
            <p className="text-xs text-neutral-500">
              ຕິດຕາມຄວາມພ້ອມໃຊ້ງານຂອງ 6 ໂມດູນຫຼັກ, ຖານຂໍ້ມູນ Storage, ການເຊື່ອມຕໍ່ BCEL One, ແລະ Audit Trail
            </p>
          </div>

          {/* Diagnostic Action Button */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-neutral-400">ກວດສອບລ້າສຸດ</div>
              <div className="text-xs font-semibold text-neutral-700">{lastCheckTime}</div>
            </div>

            <button
              type="button"
              disabled={isDiagnosing}
              onClick={handleRunDiagnostic}
              className={`px-4 py-2.5 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs cursor-pointer transition-all ${
                isDiagnosing
                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white hover:scale-[1.01]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>{isDiagnosing ? 'ກຳລັງກວດເຊັກລະບົບ...' : 'ທົດສອບກວດເຊັກ (Diagnostic)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Diagnostic Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Storage Quota Card */}
        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-blue-500" />
              <span>Storage Quota</span>
            </span>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {storageMetrics.percentUsed}%
            </span>
          </div>
          <div className="text-lg font-black text-neutral-900">
            {storageMetrics.usedKb} KB <span className="text-xs text-neutral-400 font-normal">/ {storageMetrics.maxQuotaKb} KB</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${storageMetrics.percentUsed}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-neutral-400 flex justify-between">
            <span>ບັນທຶກແລ້ວ {storageMetrics.itemCount} ຕາຕະລາງ</span>
            <span className="text-emerald-600 font-semibold">✓ ປົກກະຕິ</span>
          </div>
        </div>

        {/* Order Queue Health */}
        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>ຄິວອໍເດີ້ລໍຖ້າຈັດການ</span>
            </span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              OMS Queue
            </span>
          </div>
          <div className="text-lg font-black text-neutral-900">
            {orders.filter((o) => o.status === 'paid' || o.status === 'packing').length}{' '}
            <span className="text-xs text-neutral-400 font-normal">ອໍເດີ້ຕ້ອງຈັດສົ່ງ</span>
          </div>
          <div className="text-[11px] text-neutral-500 space-y-0.5">
            <div className="flex justify-between">
              <span>ລໍຖ້າແພັກ (Paid):</span>
              <span className="font-bold text-emerald-600">{orders.filter((o) => o.status === 'paid').length}</span>
            </div>
            <div className="flex justify-between">
              <span>ກຳລັງແພັກ (Packing):</span>
              <span className="font-bold text-blue-600">{orders.filter((o) => o.status === 'packing').length}</span>
            </div>
          </div>
        </div>

        {/* Inventory Stock Health */}
        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-purple-500" />
              <span>ສຸຂະພາບຄັງສິນຄ້າ</span>
            </span>
            {lowStockProducts.length > 0 ? (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                {lowStockProducts.length} ເຕືອນ
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                ສະຕັອກພຽງພໍ
              </span>
            )}
          </div>
          <div className="text-lg font-black text-neutral-900">
            {products.length} <span className="text-xs text-neutral-400 font-normal">ລາຍການສິນຄ້າ</span>
          </div>
          <div className="text-[11px] text-neutral-500 space-y-0.5">
            <div className="flex justify-between">
              <span>ສິນຄ້າໃກ້ໝົດ (Low):</span>
              <span className={`font-bold ${lowStockProducts.length > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>
                {lowStockProducts.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ສິນຄ້າໝົດ (Out of Stock):</span>
              <span className="font-bold text-rose-600">{products.filter((p) => p.stock <= 0).length}</span>
            </div>
          </div>
        </div>

        {/* Security & Audit Metric */}
        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Audit Trail Logs</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Active Logs
            </span>
          </div>
          <div className="text-lg font-black text-neutral-900">
            {auditLogs.length} <span className="text-xs text-neutral-400 font-normal">ບັນທຶກການເຮັດວຽກ</span>
          </div>
          <div className="text-[11px] text-neutral-500 space-y-0.5">
            <div className="flex justify-between">
              <span>ບັນທຶກມື້ນີ້:</span>
              <span className="font-bold text-neutral-800">{auditLogs.length}</span>
            </div>
            <div className="flex justify-between">
              <span>ຄວາມປອດໄພ:</span>
              <span className="font-bold text-emerald-600">✓ ບໍ່ມີຂໍ້ຜິດພາດ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 6 Core Microservices Health Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-pink-500" />
              <span>ສະຖານະການເຮັດວຽກຂອງ Microservices ທັງ 6 ດ້ານ</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              ກວດສອບຄວາມໄວ (Latency) ແລະ ຄວາມພ້ອມໃຊ້ງານຂອງແຕ່ລະໂມດູນ
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            6/6 Services Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 hover:bg-pink-50/20 hover:border-pink-200 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shadow-2xs">
                    {getServiceIcon(srv.id)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-neutral-900 line-clamp-1">{srv.nameLao}</h4>
                    <span className="text-[10px] text-neutral-400 font-mono">{srv.name}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Online</span>
                </span>
              </div>

              <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                {srv.description}
              </p>

              <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">Response Latency:</span>
                <span className="font-mono font-bold text-neutral-800 bg-white px-2 py-0.5 rounded border border-neutral-200">
                  {srv.latencyMs} ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. System Audit Logs & Activity Trail */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-500" />
              <span>ບັນທຶກປະຫວັດການເຮັດວຽກຂອງລະບົບ (System Audit Logs)</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              ບັນທຶກການກະທຳຂອງຜູ້ດູແລລະບົບ, ການປ່ຽນແປງອໍເດີ້, ສະຕັອກ ແລະ ຄວາມປອດໄພ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportLogs}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="ດາວໂຫຼດ Audit Logs ເປັນ JSON"
            >
              {isExported ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isExported ? 'ດາວໂຫຼດແລ້ວ' : 'Export Logs'}</span>
            </button>

            {auditLogs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ Audit Logs ທັງໝົດ?')) {
                    clearAuditLogs();
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                title="ລ້າງປະຫວັດ Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ລ້າງ Logs</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Logs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາການກະທຳ, ລາຍລະອຽດ ຫຼື ຜູ້ດຳເນີນການ..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 focus:border-pink-500 outline-hidden bg-neutral-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white font-medium text-neutral-700 outline-hidden cursor-pointer"
            >
              <option value="all">ທຸກໂມດູນ ({auditLogs.length})</option>
              <option value="OMS">OMS (ອໍເດີ້)</option>
              <option value="INVENTORY">INVENTORY (ຄັງສິນຄ້າ)</option>
              <option value="FINANCE">FINANCE (ການເງິນ)</option>
              <option value="PERMISSIONS">PERMISSIONS (ສິດ)</option>
              <option value="SYSTEM">SYSTEM (ລະບົບ)</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                <th className="p-3">ເວລາ (Timestamp)</th>
                <th className="p-3">ຜູ້ດຳເນີນການ</th>
                <th className="p-3">ໂມດູນ</th>
                <th className="p-3">ການກະທຳ (Action)</th>
                <th className="p-3">ລາຍລະອຽດ (Details)</th>
                <th className="p-3 text-center">ສະຖານະ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-neutral-400">
                    ບໍ່ພົບປະຫວັດການເຮັດວຽກຕາມເງື່ອນໄຂທີ່ຄົ້ນຫາ
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-pink-50/20">
                    <td className="p-3 font-mono text-neutral-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-neutral-900">{log.operator}</div>
                      <div className="text-[10px] text-neutral-400">{log.role}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-neutral-800">
                      {log.action}
                    </td>
                    <td className="p-3 text-neutral-600 max-w-xs">
                      {log.details}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.status === 'warning'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {log.status === 'success' ? '✓ ສຳເລັດ' : log.status === 'warning' ? '⚠ ເຕືອນ' : 'ℹ ຂໍ້ມູນ'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
