/**
 * emailService.js
 * Sends real vendor emails via EmailJS (browser-side, no backend needed).
 * Configure your EmailJS credentials in the app's Email Settings panel.
 */

const EMAILJS_CDN = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
const STORAGE_KEY = "aegis_emailjs_config";

/** Load persisted EmailJS config from localStorage */
export function loadEmailConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { serviceId: "", templateId: "", publicKey: "", enabled: false };
  } catch {
    return { serviceId: "", templateId: "", publicKey: "", enabled: false };
  }
}

/** Save EmailJS config to localStorage */
export function saveEmailConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Lazy-load the EmailJS SDK from CDN */
let emailjsReady = false;
async function ensureEmailJS() {
  if (emailjsReady || window.emailjs) {
    emailjsReady = true;
    return;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = EMAILJS_CDN;
    script.onload = () => { emailjsReady = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load EmailJS SDK"));
    document.head.appendChild(script);
  });
}

/**
 * Send a vendor email via EmailJS.
 * @param {object} config  - { serviceId, templateId, publicKey }
 * @param {object} params  - Template variables: { to_email, to_name, item_name, stock_pct, quantity, branch, priority, order_id, order_date }
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendVendorEmail(config, params) {
  const { serviceId, templateId, publicKey } = config;

  if (!serviceId || !templateId || !publicKey) {
    // Simulate success for demo mode when not configured
    console.log("[AEGIS EMAIL SIMULATED]", params);
    return { success: true, simulated: true, message: "Email simulated (EmailJS not configured)" };
  }

  try {
    await ensureEmailJS();
    const result = await window.emailjs.send(serviceId, templateId, params, publicKey);
    return { success: true, simulated: false, message: result.text || "Email sent successfully" };
  } catch (err) {
    console.error("[AEGIS EMAIL ERROR]", err);
    return { success: false, simulated: false, message: err?.text || err?.message || "Email send failed" };
  }
}

/**
 * Build and send the low-stock alert email to a vendor.
 * @param {object} item    - The food_item record (current_stock, total_capacity, name, priority, branch, etc.)
 * @param {object} vendor  - The vendor record (name, email, company)
 * @param {object} order   - The auto-created order record (id, quantity_requested)
 * @param {object} config  - EmailJS config
 */
export async function sendLowStockAlert(item, vendor, order, config) {
  const stockPct = Math.round((item.current_stock / item.total_capacity) * 100);

  const params = {
    to_email: vendor.email,
    to_name: vendor.name || vendor.company,
    vendor_name: vendor.name || vendor.company,
    item_name: item.name,
    item_barcode: item.barcode || item.asset_uid || `ITEM-${item.id}`,
    stock_pct: `${stockPct}%`,
    current_stock: item.current_stock,
    total_capacity: item.total_capacity,
    unit: item.unit,
    quantity_requested: order.quantity_requested,
    branch: item.branch,
    priority: item.priority,
    order_id: `REQ-${String(order.id).padStart(4, "0")}`,
    order_date: new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }),
    system_name: "Aegis Logistics — Military Food Inventory System",
    reply_to: "noreply@aegis.mil.in",
  };

  return sendVendorEmail(config, params);
}

/**
 * Build and send a manual order notification to a vendor.
 * @param {object} item    - The food_item record
 * @param {object} vendor  - The vendor record
 * @param {object} order   - The manually-created order record
 * @param {object} user    - The logged-in user who placed the order
 * @param {object} config  - EmailJS config
 */
export async function sendManualOrderEmail(item, vendor, order, user, config) {
  const params = {
    to_email: vendor.email,
    to_name: vendor.name || vendor.company,
    vendor_name: vendor.name || vendor.company,
    item_name: item.name,
    item_barcode: item.barcode || item.asset_uid || `ITEM-${item.id}`,
    stock_pct: `${Math.round((item.current_stock / item.total_capacity) * 100)}%`,
    current_stock: item.current_stock,
    total_capacity: item.total_capacity,
    unit: item.unit,
    quantity_requested: order.quantity_requested,
    branch: item.branch,
    priority: item.priority,
    order_id: `REQ-${String(order.id).padStart(4, "0")}`,
    order_date: new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }),
    requested_by: user?.name || "AEGIS OPERATOR",
    trigger_type: "Manual Requisition",
    system_name: "Aegis Logistics — Military Food Inventory System",
    reply_to: "noreply@aegis.mil.in",
  };

  return sendVendorEmail(config, params);
}

/**
 * Build and send an auto-reorder notification to a vendor.
 * Lightweight version for automatic low-stock triggers.
 * @param {object} item    - The food_item record
 * @param {object} vendor  - The vendor record
 * @param {object} order   - The auto-created order record
 * @param {object} config  - EmailJS config
 */
export async function sendAutoReorderEmail(item, vendor, order, config) {
  const stockPct = Math.round((item.current_stock / item.total_capacity) * 100);

  const params = {
    to_email: vendor.email,
    to_name: vendor.name || vendor.company,
    vendor_name: vendor.name || vendor.company,
    item_name: item.name,
    item_barcode: item.barcode || item.asset_uid || `ITEM-${item.id}`,
    stock_pct: `${stockPct}%`,
    current_stock: item.current_stock,
    total_capacity: item.total_capacity,
    unit: item.unit,
    quantity_requested: order.quantity_requested,
    branch: item.branch,
    priority: item.priority,
    order_id: `REQ-${String(order.id).padStart(4, "0")}`,
    order_date: new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    }),
    trigger_type: "Automatic Low-Stock",
    system_name: "Aegis Logistics — Military Food Inventory System",
    reply_to: "noreply@aegis.mil.in",
  };

  return sendVendorEmail(config, params);
}
