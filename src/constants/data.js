export const BRANCHES = ["Navy", "Air Defence", "Army"];
export const CATEGORIES = ["Rations", "Canned", "Frozen", "Beverages", "Dry Goods", "Perishables", "Medical Nutrition"];
export const PRIORITIES = ["Critical", "High", "Normal"];
export const ORDER_STATUSES = ["Pending", "Order Placed", "In Transit", "Delivered", "Rejected"];

export const LOCATIONS = [
  { id: 1, name: "INS Vikrant", branch: "Navy" },
  { id: 2, name: "INS Chennai", branch: "Navy" },
  { id: 3, name: "Air Base Delta", branch: "Air Defence" },
  { id: 4, name: "Air Base Omega", branch: "Air Defence" },
  { id: 5, name: "Base Alpha", branch: "Army" },
  { id: 6, name: "FOB Bravo", branch: "Army" },
];

export const VENDORS = [
  { id: 1, name: "SupremeFoods Corp", company: "SupremeFoods Corp", email: "vendor1@supremefoods.mil", phone: "+91-9876543210", rating: 4.8 },
  { id: 2, name: "DefenceRations Ltd", company: "DefenceRations Ltd", email: "vendor2@defencerations.mil", phone: "+91-9876543211", rating: 4.5 },
  { id: 3, name: "MilSpec Supplies", company: "MilSpec Supplies", email: "vendor3@milspec.mil", phone: "+91-9876543212", rating: 4.2 },
];

export const USERS = [
  { id: 1, name: "Col. Arjun Sharma", email: "admin@mil.gov.in", password: "admin123", role: "admin", branch: "Army", location_id: 5 },
  { id: 2, name: "Lt. Priya Nair", email: "officer@mil.gov.in", password: "officer123", role: "officer", branch: "Navy", location_id: 1 },
  { id: 3, name: "SupremeFoods Corp", email: "vendor1@supremefoods.mil", password: "vendor123", role: "vendor", vendor_id: 1 },
];

export const FOOD_IMAGES = {
  "MRE": "https://images.unsplash.com/photo-1585478259715-1c195ae2b568?w=200&h=150&fit=crop",
  "Drinking Water": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=200&h=150&fit=crop",
  "Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=150&fit=crop",
  "Wheat Flour": "/images/wheat-flour.svg",
  "Canned Vegetables": "/images/canned-vegetables.svg",
  "Canned Meat": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=150&fit=crop",
  "Cooking Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=150&fit=crop",
  "Sugar": "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=200&h=150&fit=crop",
  "Salt": "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=200&h=150&fit=crop",
  "Tea Coffee": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=150&fit=crop",
  "Dal": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=150&fit=crop",
  "Biscuits": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=150&fit=crop",
  "Milk Powder": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=150&fit=crop",
  "Frozen Chicken": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=200&h=150&fit=crop",
  "Bread": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=200&h=150&fit=crop",
};

export const generateItems = () => [
  { id: 1, name: "MRE", category: "Rations", branch: "Army", location_id: 5, current_stock: 120, total_capacity: 1000, unit: "packets", min_required: 200, priority: "Critical", vendor_id: 1, expiry_date: "2025-07-15", barcode: "MIL-001-MRE" },
  { id: 2, name: "Drinking Water", category: "Beverages", branch: "Navy", location_id: 1, current_stock: 45, total_capacity: 500, unit: "cans", min_required: 100, priority: "Critical", vendor_id: 2, expiry_date: "2026-12-01", barcode: "MIL-002-H2O" },
  { id: 3, name: "Rice", category: "Dry Goods", branch: "Army", location_id: 5, current_stock: 800, total_capacity: 2000, unit: "kg", min_required: 400, priority: "High", vendor_id: 1, expiry_date: "2026-06-01", barcode: "MIL-003-RCE" },
  { id: 4, name: "Wheat Flour", category: "Dry Goods", branch: "Air Defence", location_id: 3, current_stock: 300, total_capacity: 1000, unit: "kg", min_required: 200, priority: "High", vendor_id: 3, expiry_date: "2025-09-20", barcode: "MIL-004-WHT" },
  { id: 5, name: "Canned Vegetables", category: "Canned", branch: "Navy", location_id: 2, current_stock: 250, total_capacity: 800, unit: "cans", min_required: 160, priority: "Normal", vendor_id: 2, expiry_date: "2026-03-10", barcode: "MIL-005-CVG" },
  { id: 6, name: "Canned Meat", category: "Canned", branch: "Army", location_id: 6, current_stock: 90, total_capacity: 600, unit: "cans", min_required: 120, priority: "High", vendor_id: 1, expiry_date: "2025-11-30", barcode: "MIL-006-CMT" },
  { id: 7, name: "Cooking Oil", category: "Dry Goods", branch: "Air Defence", location_id: 4, current_stock: 150, total_capacity: 400, unit: "litres", min_required: 80, priority: "Normal", vendor_id: 3, expiry_date: "2025-08-15", barcode: "MIL-007-OIL" },
  { id: 8, name: "Sugar", category: "Dry Goods", branch: "Navy", location_id: 1, current_stock: 200, total_capacity: 500, unit: "kg", min_required: 100, priority: "Normal", vendor_id: 2, expiry_date: "2027-01-01", barcode: "MIL-008-SGR" },
  { id: 9, name: "Salt", category: "Dry Goods", branch: "Army", location_id: 5, current_stock: 100, total_capacity: 300, unit: "kg", min_required: 60, priority: "Normal", vendor_id: 1, expiry_date: "2028-06-01", barcode: "MIL-009-SLT" },
  { id: 10, name: "Tea Coffee", category: "Beverages", branch: "Air Defence", location_id: 3, current_stock: 80, total_capacity: 300, unit: "kg", min_required: 60, priority: "Normal", vendor_id: 3, expiry_date: "2025-10-30", barcode: "MIL-010-TEA" },
  { id: 11, name: "Dal", category: "Dry Goods", branch: "Navy", location_id: 2, current_stock: 160, total_capacity: 500, unit: "kg", min_required: 100, priority: "High", vendor_id: 2, expiry_date: "2026-04-15", barcode: "MIL-011-DAL" },
  { id: 12, name: "Biscuits", category: "Rations", branch: "Army", location_id: 6, current_stock: 50, total_capacity: 400, unit: "boxes", min_required: 80, priority: "High", vendor_id: 1, expiry_date: "2025-06-20", barcode: "MIL-012-BSC" },
  { id: 13, name: "Milk Powder", category: "Beverages", branch: "Air Defence", location_id: 4, current_stock: 120, total_capacity: 300, unit: "kg", min_required: 60, priority: "Normal", vendor_id: 3, expiry_date: "2025-12-15", barcode: "MIL-013-MLK" },
  { id: 14, name: "Frozen Chicken", category: "Frozen", branch: "Navy", location_id: 1, current_stock: 200, total_capacity: 600, unit: "kg", min_required: 120, priority: "High", vendor_id: 2, expiry_date: "2025-07-01", barcode: "MIL-014-FCK" },
  { id: 15, name: "Bread", category: "Perishables", branch: "Army", location_id: 5, current_stock: 30, total_capacity: 200, unit: "boxes", min_required: 40, priority: "Normal", vendor_id: 1, expiry_date: "2025-05-25", barcode: "MIL-015-BRD" },
];

export const initialOrders = [
  { id: 1, food_item_id: 1, vendor_id: 1, requested_by: 1, quantity_requested: 880, status: "Pending", trigger_type: "Auto", created_at: new Date(Date.now() - 172800000).toISOString(), vendor_reply: "", eta: "" },
  { id: 2, food_item_id: 12, vendor_id: 1, requested_by: 2, quantity_requested: 350, status: "Order Placed", trigger_type: "Auto", created_at: new Date(Date.now() - 86400000).toISOString(), vendor_reply: "Will deliver by scheduled date", eta: "2025-06-01" },
  { id: 3, food_item_id: 6, vendor_id: 1, requested_by: 1, quantity_requested: 510, status: "In Transit", trigger_type: "Manual", created_at: new Date(Date.now() - 43200000).toISOString(), vendor_reply: "Dispatched", eta: "2025-05-20" },
];

export const initialLogs = [
  { id: 1, food_item_id: 1, officer_id: 2, qty: 50, reason: "Field Exercise", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, food_item_id: 14, officer_id: 2, qty: 100, reason: "Weekly Rations", timestamp: new Date(Date.now() - 7200000).toISOString() },
];

export const initialAudit = [
  { id: 1, food_item_id: 1, action: "Removed", qty: 50, by: "Lt. Priya Nair", notes: "Field Exercise", ts: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, food_item_id: 2, action: "Ordered", qty: 455, by: "System Auto", notes: "Low stock trigger", ts: new Date(Date.now() - 86400000).toISOString() },
];
