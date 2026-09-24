import { Order, StoreSettings } from '../types';
import { formatLAK } from './format';

/**
 * Generate a clean, styled standalone HTML document for printing or saving as PDF
 */
export function generateReceiptHtml(order: Order, storeSettings: StoreSettings): string {
  const itemsRows = order.items
    .map((item, index) => {
      const optionsText = Object.entries(item.selectedOptions || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');

      return `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #64748b; font-size: 12px;">
            ${index + 1}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 600; color: #0f172a; font-size: 13px;">${escapeHtml(item.product.name)}</div>
            ${
              optionsText
                ? `<div style="font-size: 11px; color: #ec4899; margin-top: 2px;">${escapeHtml(optionsText)}</div>`
                : ''
            }
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 13px; color: #334155;">
            ${formatLAK(item.price)}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 13px; font-weight: 600; color: #0f172a;">
            ${item.quantity}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">
            ${formatLAK(item.price * item.quantity)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="UTF-8">
  <title>ໃບບິນຮັບເງິນ - #${order.id} - ${escapeHtml(storeSettings.storeName)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Noto Sans Lao', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .receipt-container {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 28px;
    }

    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .receipt-container {
        border: none;
        padding: 0;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #fce7f3;
      padding-bottom: 18px;
      margin-bottom: 20px;
    }

    .store-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .store-logo {
      width: 44px;
      height: 44px;
      background: #ec4899;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
    }

    .store-name {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .store-sub {
      font-size: 11px;
      color: #ec4899;
      font-weight: 600;
    }

    .receipt-badge-col {
      text-align: right;
    }

    .receipt-title {
      font-size: 18px;
      font-weight: 800;
      color: #ec4899;
      letter-spacing: 0.5px;
    }

    .order-num {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }

    .order-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #fdf2f8;
      border: 1px solid #fbcfe8;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .info-block h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #be185d;
      margin-bottom: 6px;
      font-weight: 700;
    }

    .info-item {
      font-size: 12px;
      margin-bottom: 3px;
      color: #334155;
    }

    .info-item strong {
      color: #0f172a;
    }

    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    table.items-table th {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      border-bottom: 2px solid #e2e8f0;
      padding: 10px 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
    }

    .totals-area {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
      margin-bottom: 24px;
    }

    .totals-box {
      width: 280px;
      background: #fafafa;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px 16px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 6px;
      color: #475569;
    }

    .total-row.grand-total {
      border-top: 2px dashed #cbd5e1;
      padding-top: 10px;
      margin-top: 8px;
      font-size: 15px;
      font-weight: 800;
      color: #ec4899;
    }

    .payment-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      margin-top: 6px;
    }

    .receipt-footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 18px;
      text-align: center;
      color: #64748b;
      font-size: 11px;
    }

    .footer-highlight {
      color: #ec4899;
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- Header -->
    <div class="header-row">
      <div class="store-brand">
        <div class="store-logo" style="overflow:hidden;background:#fff;border:1px solid #fce7f3;">
          <img src="/ny-store-logo.jpg" alt="Ny Store Logo" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" onerror="this.outerHTML='🌸'" />
        </div>
        <div>
          <div class="store-name">${escapeHtml(storeSettings.storeName)}</div>
          <div class="store-sub">BEAUTY & FASHION • ຮ້ານຄ້າອອນລາຍຄຸນນະພາບ</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            ໂທ / WhatsApp: ${escapeHtml(storeSettings.storePhone)} • ນະຄອນຫຼວງວຽງຈັນ
          </div>
        </div>
      </div>
      <div class="receipt-badge-col">
        <div class="receipt-title">ໃບບິນຮັບເງິນ / RECEIPT</div>
        <div class="order-num">#${escapeHtml(order.id)}</div>
        <div class="order-date">${escapeHtml(order.createdAt)}</div>
        <div>
          <span class="payment-status-badge">
            ✓ ຊຳລະຜ່ານ BCEL OnePay ແລ້ວ
          </span>
        </div>
      </div>
    </div>

    <!-- Customer & Shipping Info -->
    <div class="info-grid">
      <div class="info-block">
        <h4>ຂໍ້ມູນຜູ້ຮັບສິນຄ້າ (Customer)</h4>
        <div class="info-item"><strong>ຊື່ຜູ້ຮັບ:</strong> ${escapeHtml(order.customerName)}</div>
        <div class="info-item"><strong>ເບີໂທ:</strong> ${escapeHtml(order.customerPhone)}</div>
        <div class="info-item"><strong>ທີ່ຢູ່:</strong> ${escapeHtml(order.address)}</div>
        ${order.notes ? `<div class="info-item" style="color: #be185d;"><strong>ໝາຍເຫດ:</strong> ${escapeHtml(order.notes)}</div>` : ''}
      </div>
      <div class="info-block">
        <h4>ການຈັດສົ່ງ & ຊຳລະເງິນ (Delivery & Payment)</h4>
        <div class="info-item"><strong>ບໍລິສັດຂົນສົ່ງ:</strong> ${escapeHtml(order.shippingProvider)} Express</div>
        <div class="info-item"><strong>ເລກພັດສະດຸ (Tracking):</strong> ${escapeHtml(order.trackingNumber || 'ລໍຖ້າອັບເດດຫຼັງສົ່ງ')}</div>
        <div class="info-item"><strong>ວິທີຊຳລະ:</strong> BCEL OnePay QR Code</div>
        <div class="info-item"><strong>ສະຖານະ:</strong> ໄດ້ຮັບໃບສະລິບໂອນເງິນແລ້ວ</div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 36px; text-align: center;">#</th>
          <th style="text-align: left;">ລາຍການສິນຄ້າ (Item Description)</th>
          <th style="width: 90px; text-align: right;">ລາຄາຕໍ່ໜ່ວຍ</th>
          <th style="width: 60px; text-align: center;">ຈຳນວນ</th>
          <th style="width: 100px; text-align: right;">ລວມ (ກີບ)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-area">
      <div class="totals-box">
        <div class="total-row grand-total">
          <span>ຍອດຊຳລະສຸດທິ:</span>
          <span>${formatLAK(order.total)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="receipt-footer">
      <div class="footer-highlight">🌸 ຂອບໃຈຫຼາຍໆ ທີ່ເລືອກຊື້ສິນຄ້າກັບ ${escapeHtml(storeSettings.storeName)} 🌸</div>
      <div>ກະລຸນາເກັບຮັກສາໃບບິນ ຫຼື ລະຫັດອໍເດີ້ #${escapeHtml(order.id)} ໄວ້ສຳລັບຕິດຕາມພັດສະດຸ ແລະ ຮັບປະກັນສິນຄ້າ</div>
      <div style="margin-top: 4px; font-size: 10px; color: #94a3b8;">
        ພິມອອກເມື່ອ: ${new Date().toLocaleString('lo-LA', { hour12: false })} • Ny Store System
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string = ''): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Print or download the order receipt as a PDF using an isolated hidden iframe
 * with automatic fallback to window.print()
 */
export function printReceipt(order: Order, storeSettings: StoreSettings): void {
  try {
    const htmlContent = generateReceiptHtml(order, storeSettings);

    // Create an invisible iframe to host the print content cleanly
    const iframe = document.createElement('iframe');
    iframe.id = 'receipt-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      // Small delay to allow CSS and layout to render properly
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (printErr) {
          console.warn('Iframe print failed, calling window.print():', printErr);
          window.print();
        } finally {
          // Cleanup iframe after print dialog resolves
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3500);
        }
      }, 300);
    } else {
      window.print();
    }
  } catch (error) {
    console.error('Print receipt error:', error);
    window.print();
  }
}
