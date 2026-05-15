import { supabase } from "../lib/supabaseClient";

const normalizeAudit = (entry) => ({
  ...entry,
  by: entry.by_name,
});

const toAuditRow = (entry) => ({
  food_item_id: entry.food_item_id,
  action: entry.action,
  qty: entry.qty,
  by_name: entry.by || entry.by_name,
  notes: entry.notes || "",
  ts: entry.ts,
});

const normalizeOrder = (order) => ({
  ...order,
  eta: order.eta || "",
});

const toOrderRow = (order) => ({
  food_item_id: order.food_item_id,
  vendor_id: order.vendor_id,
  requested_by: order.requested_by,
  quantity_requested: order.quantity_requested,
  status: order.status,
  trigger_type: order.trigger_type,
  created_at: order.created_at,
  vendor_reply: order.vendor_reply || "",
  eta: order.eta || null,
});

export async function loadInventoryData() {
  const [
    locationsResult,
    vendorsResult,
    usersResult,
    itemsResult,
    ordersResult,
    logsResult,
    auditResult,
  ] = await Promise.all([
    supabase.from("locations").select("*").order("id"),
    supabase.from("vendors").select("*").order("id"),
    supabase.from("app_users").select("*").order("id"),
    supabase.from("food_items").select("*").order("id"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("checkout_logs").select("*").order("timestamp", { ascending: false }),
    supabase.from("audit_entries").select("*").order("ts", { ascending: false }),
  ]);

  const failed = [
    locationsResult,
    vendorsResult,
    usersResult,
    itemsResult,
    ordersResult,
    logsResult,
    auditResult,
  ].find((result) => result.error);

  if (failed) throw failed.error;

  return {
    locations: locationsResult.data || [],
    vendors: vendorsResult.data || [],
    users: usersResult.data || [],
    items: itemsResult.data || [],
    orders: (ordersResult.data || []).map(normalizeOrder),
    logs: logsResult.data || [],
    audit: (auditResult.data || []).map(normalizeAudit),
  };
}

export async function updateFoodItem(id, values) {
  const { data, error } = await supabase
    .from("food_items")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertFoodItem(item) {
  const { id, ...row } = item;
  const { data, error } = await supabase
    .from("food_items")
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertOrder(order) {
  const { data, error } = await supabase
    .from("orders")
    .insert(toOrderRow(order))
    .select()
    .single();
  if (error) throw error;
  return normalizeOrder(data);
}

export async function updateOrder(id, values) {
  const row = { ...values };
  if ("eta" in row) row.eta = row.eta || null;

  const { data, error } = await supabase
    .from("orders")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return normalizeOrder(data);
}

export async function insertCheckoutLog(log) {
  const { data, error } = await supabase
    .from("checkout_logs")
    .insert(log)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertAuditEntry(entry) {
  const { data, error } = await supabase
    .from("audit_entries")
    .insert(toAuditRow(entry))
    .select()
    .single();
  if (error) throw error;
  return normalizeAudit(data);
}

/**
 * Update vendor email and contact information
 * @param {number} vendorId - Vendor ID
 * @param {object} values - {email, contact_name, phone}
 */
export async function updateVendor(vendorId, values) {
  const { data, error } = await supabase
    .from("vendors")
    .update(values)
    .eq("id", vendorId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get vendor by ID with all details
 * @param {number} vendorId - Vendor ID
 */
export async function getVendor(vendorId) {
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", vendorId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get orders with related item and vendor details
 * @param {object} filters - Optional filters {status, vendorId, itemId}
 */
export async function getOrdersWithDetails(filters = {}) {
  let query = supabase
    .from("orders")
    .select("*, food_items(name, barcode), vendors(name, email)");

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.vendorId) query = query.eq("vendor_id", filters.vendorId);
  if (filters.itemId) query = query.eq("food_item_id", filters.itemId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Get reorder statistics
 * @returns {object} - {totalAuto, totalManual, totalPending, avgResponseTime}
 */
export async function getReorderStats() {
  const [
    { data: orders },
    { data: autoItems },
  ] = await Promise.all([
    supabase.from("orders").select("*"),
    supabase.from("food_items").select("id, auto_reorder"),
  ]);

  const autoOrders = orders?.filter((o) => o.trigger_type === "Auto-Low-Stock") || [];
  const manualOrders = orders?.filter((o) => o.trigger_type === "Manual") || [];
  const pending = orders?.filter((o) => o.status === "Pending") || [];
  const itemsWithAuto = autoItems?.filter((i) => i.auto_reorder) || [];

  return {
    totalAuto: autoOrders.length,
    totalManual: manualOrders.length,
    totalPending: pending.length,
    itemsWithAutoReorder: itemsWithAuto.length,
  };
}
