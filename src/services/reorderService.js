/**
 * reorderService.js
 * Intelligent auto-reorder system with duplicate prevention and mode support.
 * Modes: Manual Approval (pending review) or Fully Automatic (auto-confirm)
 */

import { supabase } from "../lib/supabaseClient";

/**
 * Get active pending orders for an item
 * @param {number} itemId - Food item ID
 * @returns {Promise<Array>} - Pending orders
 */
export async function getPendingOrders(itemId) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("food_item_id", itemId)
    .eq("status", "Pending")
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

/**
 * Check if auto-reorder can proceed (cooldown validation)
 * @param {number} itemId - Food item ID
 * @param {number} cooldownMinutes - Cooldown period in minutes (default 60)
 * @returns {Promise<{canReorder: boolean, lastOrderTime: string|null}>}
 */
export async function checkReorderCooldown(itemId, cooldownMinutes = 60) {
  const pending = await getPendingOrders(itemId);
  
  if (pending.length === 0) {
    return { canReorder: true, lastOrderTime: null };
  }

  const lastOrder = pending[0];
  const orderTime = new Date(lastOrder.created_at);
  const now = new Date();
  const diffMinutes = (now - orderTime) / (1000 * 60);

  return {
    canReorder: diffMinutes >= cooldownMinutes,
    lastOrderTime: lastOrder.created_at,
  };
}

/**
 * Normalize auto-reorder settings
 * @param {object} item - Food item from database
 * @returns {object} - Normalized reorder config
 */
function normalizeReorderConfig(item) {
  return {
    autoReorder: item.auto_reorder !== false,
    mode: item.reorder_mode || "manual",
    thresholdPercent: item.reorder_threshold_pct || 20,
    cooldownMinutes: item.reorder_cooldown_mins || 60,
  };
}

/**
 * Calculate stock percentage
 * @param {number} current - Current stock
 * @param {number} max - Max capacity
 * @returns {number} - Percentage (0-100)
 */
export function calcStockPct(current, max) {
  return max > 0 ? Math.round((current / max) * 100) : 0;
}

/**
 * Check if item stock is below threshold
 * @param {object} item - Food item with current_stock and total_capacity
 * @param {number} thresholdPercent - Threshold percentage (default 20)
 * @returns {boolean}
 */
export function isStockBelowThreshold(item, thresholdPercent = 20) {
  const pct = calcStockPct(item.current_stock, item.total_capacity);
  return pct <= thresholdPercent;
}

/**
 * Calculate recommended reorder quantity
 * @param {object} item - Food item
 * @param {number} bufferPercent - Buffer percentage of max capacity (default 80)
 * @returns {number} - Quantity to order
 */
export function calcReorderQty(item, bufferPercent = 80) {
  const targetStock = Math.round((item.total_capacity * bufferPercent) / 100);
  return Math.max(1, targetStock - item.current_stock);
}

/**
 * Prepare auto-reorder data
 * @param {object} item - Food item
 * @param {object} vendor - Vendor record
 * @param {object} currentUser - Current user
 * @returns {object} - Order and audit data ready for insertion
 */
export function prepareAutoReorderData(item, vendor, currentUser) {
  const qty = calcReorderQty(item);
  
  return {
    order: {
      food_item_id: item.id,
      vendor_id: item.vendor_id,
      requested_by: currentUser.id,
      quantity_requested: qty,
      status: "Pending",
      trigger_type: "Auto-Low-Stock",
      created_at: new Date().toISOString(),
      vendor_reply: "",
      eta: "",
    },
    audit: {
      food_item_id: item.id,
      action: "Auto-Reorder",
      qty: qty,
      by_name: currentUser.name || "AEGIS AUTO-REORDER",
      notes: `Auto-trigger: Stock at ${calcStockPct(item.current_stock, item.total_capacity)}%`,
      ts: new Date().toISOString(),
    },
    reorderQty: qty,
    stockPct: calcStockPct(item.current_stock, item.total_capacity),
  };
}

/**
 * Attempt auto-reorder with full validation
 * @param {object} item - Food item
 * @param {object} vendor - Vendor record
 * @param {object} currentUser - Current user
 * @param {object} config - Email config for EmailJS
 * @param {Function} insertOrderFn - Callback to insert order
 * @param {Function} insertAuditFn - Callback to insert audit
 * @param {Function} sendEmailFn - Callback to send email
 * @returns {Promise<{success: boolean, order?: object, error?: string}>}
 */
export async function attemptAutoReorder(
  item,
  vendor,
  currentUser,
  config,
  insertOrderFn,
  insertAuditFn,
  sendEmailFn
) {
  try {
    // Validation checks
    const reorderCfg = normalizeReorderConfig(item);
    
    if (!reorderCfg.autoReorder) {
      return { success: false, error: "Auto-reorder disabled for this item" };
    }

    if (!isStockBelowThreshold(item, reorderCfg.thresholdPercent)) {
      return { success: false, error: "Stock above threshold" };
    }

    // Check pending orders
    const pending = await getPendingOrders(item.id);
    if (pending.length > 0) {
      return { success: false, error: "Pending order exists for this item" };
    }

    // Check cooldown
    const cooldown = await checkReorderCooldown(item.id, reorderCfg.cooldownMinutes);
    if (!cooldown.canReorder) {
      return { success: false, error: "Cooldown period not elapsed" };
    }

    // Prepare order data
    const { order, audit, reorderQty, stockPct } = prepareAutoReorderData(item, vendor, currentUser);

    // Insert order
    const createdOrder = await insertOrderFn(order);

    // Insert audit
    await insertAuditFn(audit);

    // Send email
    const emailResult = await sendEmailFn(item, vendor, createdOrder, config);

    return {
      success: true,
      order: createdOrder,
      reorderQty,
      stockPct,
      emailSent: emailResult.success,
      emailSimulated: emailResult.simulated,
    };
  } catch (err) {
    console.error("[AEGIS AUTO-REORDER ERROR]", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * Process low-stock detection for all items (batch operation)
 * Called periodically or on demand by scheduler
 * @param {Array} items - All food items
 * @param {Array} vendors - All vendors
 * @param {object} currentUser - Current user (system account)
 * @param {object} config - Email config
 * @param {Function} insertOrderFn - Order insertion callback
 * @param {Function} insertAuditFn - Audit insertion callback
 * @param {Function} sendEmailFn - Email callback
 * @returns {Promise<Array>} - Results of all auto-reorder attempts
 */
export async function processLowStockDetection(
  items,
  vendors,
  currentUser,
  config,
  insertOrderFn,
  insertAuditFn,
  sendEmailFn
) {
  const results = [];

  for (const item of items) {
    const vendor = vendors.find((v) => v.id === item.vendor_id);
    if (!vendor) continue;

    const result = await attemptAutoReorder(
      item,
      vendor,
      currentUser,
      config,
      insertOrderFn,
      insertAuditFn,
      sendEmailFn
    );

    results.push({
      itemId: item.id,
      itemName: item.name,
      ...result,
    });
  }

  return results;
}

/**
 * Update food item reorder settings
 * @param {number} itemId - Food item ID
 * @param {object} settings - {autoReorder, reorderMode, thresholdPercent, cooldownMinutes}
 * @returns {Promise<object>} - Updated food item
 */
export async function updateReorderSettings(itemId, settings) {
  const {
    autoReorder = true,
    reorderMode = "manual",
    thresholdPercent = 20,
    cooldownMinutes = 60,
  } = settings;

  const { data, error } = await supabase
    .from("food_items")
    .update({
      auto_reorder: autoReorder,
      reorder_mode: reorderMode,
      reorder_threshold_pct: thresholdPercent,
      reorder_cooldown_mins: cooldownMinutes,
    })
    .eq("id", itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get reorder status for an item
 * @param {object} item - Food item
 * @param {Array} orders - All orders
 * @returns {object} - Reorder status info
 */
export function getReorderStatus(item, orders) {
  const config = normalizeReorderConfig(item);
  const stockPct = calcStockPct(item.current_stock, item.total_capacity);
  const belowThreshold = isStockBelowThreshold(item, config.thresholdPercent);
  const pendingForItem = orders.filter(
    (o) => o.food_item_id === item.id && o.status === "Pending"
  );

  return {
    autoReorderEnabled: config.autoReorder,
    mode: config.mode,
    thresholdPercent: config.thresholdPercent,
    stockPct,
    belowThreshold,
    hasPendingOrder: pendingForItem.length > 0,
    pendingOrderCount: pendingForItem.length,
    recommendedQty: calcReorderQty(item),
  };
}
