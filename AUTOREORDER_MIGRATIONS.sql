-- Auto-Reorder System Database Migrations
-- Run these SQL commands in Supabase to add auto-reorder support

-- 1. Add auto-reorder columns to food_items table
ALTER TABLE food_items 
ADD COLUMN IF NOT EXISTS auto_reorder BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reorder_mode TEXT DEFAULT 'manual' CHECK (reorder_mode IN ('manual', 'auto')),
ADD COLUMN IF NOT EXISTS reorder_threshold_pct INTEGER DEFAULT 20 CHECK (reorder_threshold_pct >= 5 AND reorder_threshold_pct <= 50),
ADD COLUMN IF NOT EXISTS reorder_cooldown_mins INTEGER DEFAULT 60 CHECK (reorder_cooldown_mins >= 15 AND reorder_cooldown_mins <= 1440);

-- 2. Add vendor contact columns to vendors table
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_trigger_type ON orders(trigger_type);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_items_auto_reorder ON food_items(auto_reorder);
CREATE INDEX IF NOT EXISTS idx_food_items_stock_level ON food_items(current_stock, total_capacity);

-- 4. Create view for auto-reorder monitoring
CREATE OR REPLACE VIEW reorder_status AS
SELECT 
  fi.id,
  fi.name,
  fi.current_stock,
  fi.total_capacity,
  ROUND((fi.current_stock::numeric / NULLIF(fi.total_capacity, 0)) * 100, 1) as stock_pct,
  fi.reorder_threshold_pct,
  CASE 
    WHEN fi.current_stock::numeric / NULLIF(fi.total_capacity, 0) * 100 <= fi.reorder_threshold_pct THEN 'BELOW_THRESHOLD'
    ELSE 'OK'
  END as stock_status,
  fi.auto_reorder,
  fi.reorder_mode,
  (SELECT COUNT(*) FROM orders WHERE food_item_id = fi.id AND status = 'Pending') as pending_count,
  (SELECT MAX(created_at) FROM orders WHERE food_item_id = fi.id AND status = 'Pending') as last_pending_order,
  v.name as vendor_name,
  v.email as vendor_email
FROM food_items fi
LEFT JOIN vendors v ON fi.vendor_id = v.id
ORDER BY stock_pct ASC;

-- 5. Create audit event types for auto-reorder
-- Note: This is informational; audit_entries table already exists

-- Sample queries for monitoring

-- Get all items below threshold with auto-reorder enabled
-- SELECT * FROM reorder_status WHERE stock_status = 'BELOW_THRESHOLD' AND auto_reorder = true;

-- Get items with pending orders
-- SELECT * FROM reorder_status WHERE pending_count > 0;

-- Get auto-reorder statistics
-- SELECT 
--   COUNT(*) as total_items,
--   SUM(CASE WHEN auto_reorder THEN 1 ELSE 0 END) as items_with_autoreorder,
--   SUM(pending_count) as total_pending_orders,
--   COUNT(CASE WHEN stock_status = 'BELOW_THRESHOLD' THEN 1 END) as items_below_threshold
-- FROM reorder_status;

-- Get recent auto-reorder activity
-- SELECT 
--   o.id,
--   o.food_item_id,
--   fi.name,
--   o.trigger_type,
--   o.status,
--   o.quantity_requested,
--   o.created_at,
--   v.name as vendor_name,
--   v.email
-- FROM orders o
-- JOIN food_items fi ON o.food_item_id = fi.id
-- JOIN vendors v ON o.vendor_id = v.id
-- WHERE o.trigger_type = 'Auto-Low-Stock'
-- ORDER BY o.created_at DESC
-- LIMIT 20;
