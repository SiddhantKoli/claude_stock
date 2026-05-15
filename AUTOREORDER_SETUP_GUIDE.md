# Auto-Reorder System Implementation Guide

## Quick Start (5 steps)

### Step 1: Database Setup
1. Open Supabase console for your project
2. Navigate to "SQL Editor"
3. Copy contents of `AUTOREORDER_MIGRATIONS.sql`
4. Paste and execute the SQL migrations
5. Verify columns were added:
   - `food_items`: `auto_reorder`, `reorder_mode`, `reorder_threshold_pct`, `reorder_cooldown_mins`
   - `vendors`: `email`, `contact_name`, `phone`

### Step 2: Update Vendor Information
Execute this SQL to add vendor emails (update values for your vendors):
```sql
UPDATE vendors 
SET email = 'supplier@example.com', contact_name = 'John Supplier', phone = '+1-555-0100'
WHERE id = 1;

UPDATE vendors 
SET email = 'vendor@supremefoods.mil', contact_name = 'Supply Manager', phone = '+91-XXXXXXXXXX'
WHERE name = 'Supreme Foods';
```

### Step 3: Configure EmailJS
To send real vendor emails, configure EmailJS:

1. Create account at [emailjs.com](https://www.emailjs.com)
2. Create Email Service (Gmail, SendGrid, etc.)
3. Create Email Template with variables:
   - `to_email`
   - `item_name`
   - `stock_pct`
   - `quantity_requested`
   - `order_id`
   - `trigger_type`
   - `vendor_name`

4. In the app, go to "Settings" → "Email Configuration"
5. Enter:
   - Service ID
   - Template ID
   - Public Key
6. Click "Test Configuration"

### Step 4: Enable Auto-Reorder for Items
In Admin Dashboard:

1. Navigate to "Inventory" tab
2. Select an item to configure
3. Expand "Auto-Reorder Configuration"
4. Choose settings:
   - Enable Auto-Reorder: ✓
   - Mode: "Manual Approval" (recommended for initial setup)
   - Stock Threshold: 20%
   - Cooldown Period: 60 minutes
5. Click "Save Settings"

### Step 5: Start Monitoring
1. Scheduler automatically activates for all admins
2. Check "Dashboard" for auto-reorder metrics
3. Monitor "Email Log" for notifications sent
4. Review "Orders" tab for auto-created orders

---

## Features Overview

### Auto-Reorder Modes

#### Manual Approval (Recommended for Initial Setup)
```
Stock drops below 20%
  ↓
Auto-reorder triggers
  ↓
Order created with status "Pending"
  ↓
Admin reviews and approves
  ↓
Order marked "Order Placed"
  ↓
Vendor receives email notification
```

**Benefits:**
- Admin control and oversight
- Prevent erroneous orders
- Review before committing
- Good for high-value items

**Configuration:**
```javascript
reorderMode: 'manual'
// Orders are "Pending" until admin action
```

#### Fully Automatic
```
Stock drops below 15%
  ↓
Auto-reorder triggers
  ↓
Order created with status "Order Placed"
  ↓
Vendor receives immediate notification
  ↓
Fulfillment begins immediately
```

**Benefits:**
- Zero manual intervention
- Immediate vendor action
- Ideal for consumables
- Faster restocking

**Configuration:**
```javascript
reorderMode: 'auto'
// Orders are "Order Placed" immediately
```

### Duplicate Prevention

The system prevents accidental duplicate orders through two mechanisms:

#### 1. Pending Order Check
```javascript
// Blocks new reorder if any pending order exists
const pending = await getPendingOrders(itemId);
if (pending.length > 0) {
  return { success: false, error: "Pending order exists" };
}
```

#### 2. Cooldown Period
```javascript
// Minimum time between consecutive reorders
const cooldown = await checkReorderCooldown(itemId, 60); // 60 minutes
if (!cooldown.canReorder) {
  return { success: false, error: "Cooldown period not elapsed" };
}
```

### Threshold Management

Configure when auto-reorder triggers:

```
Threshold: 20%
├─ 20% to 0% → Triggers reorder
├─ 40% to 21% → No reorder
└─ 100% to 41% → No reorder
```

**Recommended Thresholds:**
- **Critical Items** (medical, emergency): 30%
- **Standard Items** (regular supplies): 20%
- **Bulk Items** (high volume): 15%
- **Perishables** (short shelf life): 25%

### Email Notifications

Auto-reorder sends concise emails to vendors:

**Subject:** `[AEGIS AUTO-ALERT] Low Stock: Rice at 18%`

**Body includes:**
```
Vendor: Supreme Foods
Item: Rice (Basmati, 1kg packets)
Current Stock: 180 / 1000 packets (18%)
Requested Quantity: 820 packets
Order ID: REQ-0042
Priority: High
Branch: Army Central Depot
Trigger: Automatic Low-Stock Detection
```

---

## Configuration Templates

### Template 1: High-Security Items
```javascript
// Pharmaceuticals, medical supplies, weapons
{
  autoReorder: true,
  reorderMode: 'manual',        // Admin approval required
  thresholdPercent: 30,          // Higher threshold = more buffer
  cooldownMinutes: 180           // 3 hours between orders
}
```

### Template 2: Standard Consumables
```javascript
// Standard food, beverages, regular supplies
{
  autoReorder: true,
  reorderMode: 'manual',        // Review before approval
  thresholdPercent: 20,          // Standard buffer
  cooldownMinutes: 60            // 1 hour between orders
}
```

### Template 3: High-Volume Routine Items
```javascript
// Rice, flour, standard rations
{
  autoReorder: true,
  reorderMode: 'auto',           // Automatic, no review
  thresholdPercent: 15,          // Lower threshold, high volume
  cooldownMinutes: 120           // 2 hours between orders
}
```

### Template 4: Perishables
```javascript
// Dairy, fresh produce, items with shelf life
{
  autoReorder: true,
  reorderMode: 'manual',        // Review for freshness
  thresholdPercent: 25,          // Higher to prevent waste
  cooldownMinutes: 240           // 4 hours to prevent overflow
}
```

---

## Monitoring & Analytics

### Dashboard Metrics
```
Auto-Reorder Statistics:
├─ Total Auto-Reorders: 47
├─ Pending Orders: 3
├─ Items Enabled: 62/85
└─ Last Check: 2 minutes ago
```

### Useful Queries

**Get items below threshold:**
```javascript
import { getReorderStatus } from './services/reorderService';

data.items.forEach(item => {
  const status = getReorderStatus(item, data.orders);
  if (status.belowThreshold) {
    console.log(`${item.name}: ${status.stockPct}%`);
  }
});
```

**Get auto-reorder activity:**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as orders,
  SUM(quantity_requested) as total_qty
FROM orders 
WHERE trigger_type = 'Auto-Low-Stock'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**Get vendor response times:**
```sql
SELECT 
  v.name,
  AVG(EXTRACT(EPOCH FROM (o.updated_at - o.created_at))/3600) as avg_hours,
  COUNT(*) as total_orders
FROM orders o
JOIN vendors v ON o.vendor_id = v.id
WHERE o.trigger_type = 'Auto-Low-Stock' AND o.status = 'Delivered'
GROUP BY v.name;
```

---

## Troubleshooting

### Problem: No Auto-Reorders Triggering

**Check 1: Scheduler running?**
```javascript
// In browser console
console.log(scheduler?.getStatus());
// Should show: { isRunning: true, lastRun: ..., runCount: ... }
```

**Check 2: Auto-reorder enabled on items?**
```sql
SELECT name, auto_reorder, reorder_threshold_pct 
FROM food_items 
WHERE auto_reorder = false;
-- Should return items you deliberately disabled
```

**Check 3: Stock below threshold?**
```sql
SELECT 
  name, 
  current_stock, 
  total_capacity,
  ROUND((current_stock::numeric/total_capacity)*100) as pct,
  reorder_threshold_pct
FROM food_items
WHERE (current_stock::numeric/total_capacity)*100 < reorder_threshold_pct;
```

**Check 4: Pending orders blocking?**
```sql
SELECT 
  fi.name,
  COUNT(o.id) as pending_count,
  MAX(o.created_at) as last_order
FROM food_items fi
LEFT JOIN orders o ON fi.id = o.food_item_id AND o.status = 'Pending'
GROUP BY fi.name
HAVING COUNT(o.id) > 0;
```

### Problem: Emails Not Sending

**Check 1: EmailJS configured?**
```javascript
// In browser console
import { loadEmailConfig } from './services/emailService';
const config = loadEmailConfig();
console.log('Service ID:', config.serviceId ? '✓' : '✗');
console.log('Template ID:', config.templateId ? '✓' : '✗');
console.log('Public Key:', config.publicKey ? '✓' : '✗');
```

**Check 2: Vendor emails set?**
```sql
SELECT name, email FROM vendors WHERE email IS NULL;
-- All vendors should have email addresses
```

**Check 3: Email log status**
- Dashboard → Settings → View Email Log
- Look for errors and failed attempts
- Check EmailJS account for rejection reasons

### Problem: Duplicate Orders Created

**Check: Cooldown period**
```javascript
import { checkReorderCooldown } from './services/reorderService';
const cooldown = await checkReorderCooldown(itemId, 60);
console.log(cooldown);
// Should show: { canReorder: false, lastOrderTime: '...' }
```

**Solution:** Increase cooldown period:
```javascript
await updateReorderSettings(itemId, {
  cooldownMinutes: 180 // 3 hours
});
```

---

## Performance Tuning

### Scheduler Interval
```javascript
// Default: 5 minutes (checks every 5 min)
const scheduler = createLowStockScheduler(5);

// For high-frequency items: 2 minutes
const scheduler = createLowStockScheduler(2);

// For stable inventory: 15 minutes
const scheduler = createLowStockScheduler(15);
```

### Threshold Tuning
```
If too many false triggers (wasting time):
  ↓ Increase threshold percentage
  ↓ Increase cooldown period

If too few reorders (stock running low):
  ↓ Decrease threshold percentage
  ↓ Decrease cooldown period
```

### Email Optimization
```javascript
// Batch emails to same vendor
const vendorOrders = orders.filter(o => o.vendor_id === vendorId);
// Send single summary email instead of multiple

// Aggregate low-stock alerts
// Instead of 5 emails, send 1 daily summary
```

---

## Migration from Manual Ordering

### Phase 1: Pilot (Weeks 1-2)
- Enable auto-reorder on 5-10 non-critical items
- Use "Manual Approval" mode
- Monitor closely for issues
- Tune thresholds based on results

### Phase 2: Expansion (Weeks 3-4)
- Enable on 30-40 additional items
- Keep "Manual Approval" mode
- Review approval workflows
- Increase confidence

### Phase 3: Automation (Weeks 5+)
- Switch suitable items to "Automatic" mode
- Start with low-risk consumables
- Monitor for vendor compliance
- Scale to full automation

### Parallel Operation
- Keep manual ordering available as backup
- Don't retire manual system
- Use for emergency/out-of-threshold orders
- Fallback for auto-reorder failures

---

## Best Practices

### 1. Vendor Communication
```
Before enabling auto-reorder:
├─ Notify vendors of system
├─ Share order format and email templates
├─ Establish response time expectations
└─ Set up direct contact for issues
```

### 2. Threshold Setting
```
Start conservative:
├─ First week: 25% threshold (safe buffer)
├─ Analyze first week data
├─ Adjust based on usage patterns
└─ Optimize after stabilization
```

### 3. Monitoring Cadence
```
Daily: Check "Email Log" for failed sends
Weekly: Review "Auto-Reorder Stats"
Monthly: Analyze "Reorder Activity Report"
Quarterly: Vendor performance review
```

### 4. Testing Procedure
```
Before production deployment:
├─ Create test items with 0 stock
├─ Verify auto-reorder triggers
├─ Check email sending
├─ Validate pending orders created
├─ Confirm audit logging
└─ Test with all browsers
```

---

## Support & Resources

- **Error Logs:** Browser Console (F12)
- **Email Issues:** EmailJS Dashboard
- **Database Queries:** Supabase SQL Editor
- **Scheduler Status:** `scheduler.getStatus()`
- **Reorder Status:** `getReorderStatus(item, orders)`

---

## Rollback Procedure

If auto-reorder causes issues:

### Quick Disable
```javascript
// Disable all auto-reorders
UPDATE food_items SET auto_reorder = false;

// Or disable scheduler
setAutoReorderEnabled(false);
```

### Complete Rollback
```sql
-- Remove auto-reorder columns
ALTER TABLE food_items 
DROP COLUMN auto_reorder,
DROP COLUMN reorder_mode,
DROP COLUMN reorder_threshold_pct,
DROP COLUMN reorder_cooldown_mins;

-- Drop indexes
DROP INDEX idx_food_items_auto_reorder;
DROP INDEX idx_orders_trigger_type;
```

---

## Future Roadmap

### Coming Soon
- [ ] Demand forecasting integration
- [ ] Vendor SLA tracking
- [ ] Bulk order optimization
- [ ] Dynamic threshold adjustment
- [ ] Mobile app notifications
- [ ] API for external vendors

### Long-term
- [ ] Machine learning-based ordering
- [ ] Multi-vendor consolidation
- [ ] Predictive stock analysis
- [ ] Advanced reporting dashboard
- [ ] Automated vendor scoring

