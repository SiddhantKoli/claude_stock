# Auto-Reorder System Documentation

## Overview

The Intelligent Inventory Auto-Reorder System automatically triggers purchase orders when stock levels fall below a configurable threshold. It includes duplicate prevention, cooldown periods, email notifications, and two operational modes.

## Architecture

### Services

#### 1. **reorderService.js** 
Core business logic for auto-reorder operations.

**Key Functions:**
- `isStockBelowThreshold(item, thresholdPercent)` - Check if stock is below threshold
- `calcReorderQty(item, bufferPercent)` - Calculate recommended reorder quantity
- `attemptAutoReorder(...)` - Validate and trigger reorder with full validation
- `processLowStockDetection(...)` - Batch process all items for low-stock conditions
- `checkReorderCooldown(itemId, cooldownMinutes)` - Prevent duplicate orders
- `getPendingOrders(itemId)` - Get active pending orders
- `updateReorderSettings(itemId, settings)` - Configure item-level settings
- `getReorderStatus(item, orders)` - Get current reorder state

**Validation Checks:**
- Auto-reorder must be enabled for item
- Stock must be below configured threshold
- No pending orders exist for item
- Cooldown period has elapsed since last order

#### 2. **lowStockScheduler.js**
Periodic inventory monitoring service.

**Features:**
- Configurable check interval (default: 5 minutes)
- Async callback execution
- Execution history and statistics
- Start/stop controls
- Status reporting

**Usage:**
```javascript
const scheduler = createLowStockScheduler(5); // 5-minute interval
scheduler.start(checkFunction);
// Later...
scheduler.stop();
```

#### 3. **emailService.js** (Enhanced)
Email notification system with auto-reorder support.

**New Functions:**
- `sendAutoReorderEmail(item, vendor, order, config)` - Lightweight auto-reorder alert
- Existing: `sendManualOrderEmail()`, `sendLowStockAlert()`

**Email Triggers:**
- Automatic low-stock reorder
- Manual admin order
- Low-stock alert
- Delivery confirmation

#### 4. **inventoryApi.js** (Enhanced)
Database operations and vendor management.

**New Functions:**
- `updateVendor(vendorId, values)` - Update vendor contact info
- `getVendor(vendorId)` - Retrieve vendor details
- `getOrdersWithDetails(filters)` - Get orders with related data
- `getReorderStats()` - Statistics on auto-reorder activity

## Database Schema

### food_items table
Additional columns:
```
- auto_reorder (BOOLEAN, default: true)
- reorder_mode (TEXT, values: 'manual', 'auto')
- reorder_threshold_pct (INTEGER, default: 20)
- reorder_cooldown_mins (INTEGER, default: 60)
```

### vendors table
Additional columns:
```
- email (TEXT) - Primary contact email for order notifications
- contact_name (TEXT) - Vendor contact person name
- phone (TEXT) - Vendor phone number
```

### orders table
Existing usage:
```
- status: 'Pending', 'Order Placed', 'In Transit', 'Delivered'
- trigger_type: 'Manual', 'Auto-Low-Stock'
```

## Configuration

### Item-Level Settings

Each food item can have individual reorder configuration:

| Setting | Type | Default | Range |
|---------|------|---------|-------|
| **autoReorder** | Boolean | true | - |
| **reorderMode** | String | manual | manual \| auto |
| **thresholdPercent** | Number | 20 | 5-50% |
| **cooldownMinutes** | Number | 60 | 15-1440 |

### Modes

#### Manual Approval Mode
- Order is created with status "Pending"
- Admin reviews order before approval
- Admin can reject, modify, or confirm
- Email sent to vendor with order details
- Suitable for high-value items

#### Fully Automatic Mode
- Order is created and marked "Order Placed"
- No admin review required
- Vendor receives automatic notification
- Immediate action taken
- Suitable for consumables and routine items

## Implementation Flow

### 1. Stock Level Check
```
Every 5 minutes (scheduler):
  For each item:
    - Calculate current stock percentage
    - Compare to threshold_pct
    - If below threshold → proceed to validation
```

### 2. Validation
```
- Is auto_reorder enabled? → Continue
- Is stock below threshold? → Continue
- Are there pending orders? → Skip (prevent duplicates)
- Has cooldown elapsed? → Continue
- If all checks pass → Create order
```

### 3. Order Creation
```
- Determine order quantity (from current stock to 80% of capacity)
- Create order with:
  - status: Pending (manual mode) or Order Placed (auto mode)
  - trigger_type: Auto-Low-Stock
  - timestamp: current time
- Log to audit trail
- Send email notification to vendor
```

### 4. Notification
```
- Email subject: [AEGIS AUTO-ALERT] Low Stock: [Item Name] at [%]
- Includes:
  - Current stock level
  - Recommended order quantity
  - Item specifications
  - Order tracking ID
- Uses token-efficient template
```

## Usage Examples

### Configure Item for Auto-Reorder (Manual Approval)
```javascript
await updateReorderSettings(itemId, {
  autoReorder: true,
  reorderMode: 'manual',
  thresholdPercent: 20,
  cooldownMinutes: 60
});
```

### Configure Item for Fully Automatic Ordering
```javascript
await updateReorderSettings(itemId, {
  autoReorder: true,
  reorderMode: 'auto',
  thresholdPercent: 15,
  cooldownMinutes: 120
});
```

### Get Item Reorder Status
```javascript
const status = getReorderStatus(item, allOrders);
console.log({
  autoReorderEnabled: status.autoReorderEnabled,
  stockPct: status.stockPct,
  belowThreshold: status.belowThreshold,
  hasPendingOrder: status.hasPendingOrder
});
```

### Start Low-Stock Scheduler
```javascript
const scheduler = createLowStockScheduler(5);
scheduler.start(async () => {
  return await processLowStockDetection(
    items,
    vendors,
    currentUser,
    emailConfig,
    insertOrderFn,
    insertAuditFn,
    sendEmailFn
  );
});
```

## Duplicate Prevention

### Cooldown-Based Prevention
- Tracks last order creation time for each item
- Minimum `cooldownMinutes` must elapse before new reorder
- Prevents accidental multiple orders from repeated low-stock checks

### Pending Order Check
- Scans for existing "Pending" orders on item
- Blocks new reorder if any pending order exists
- Prevents cascading orders before vendor responds

### Implementation
```javascript
// Combined validation
const cooldown = await checkReorderCooldown(itemId, 60);
if (!cooldown.canReorder) {
  return { success: false, error: "Cooldown period not elapsed" };
}

const pending = await getPendingOrders(itemId);
if (pending.length > 0) {
  return { success: false, error: "Pending order exists" };
}
```

## Token Efficiency

### Reusable Functions
- Single responsibility functions (DRY principle)
- Parameters passed as objects to minimize repeated logic
- Shared calculation functions (e.g., `calcStockPct()`)

### Minimal Payloads
```javascript
// Audit log stores minimal data
{
  food_item_id, action, qty, by_name, notes, ts
}

// Email uses compact templates
{
  to_email, item_name, stock_pct, quantity_requested, order_id
}
```

### Short API Responses
- Database queries use `.select()` to specify only needed columns
- Batch operations reduce database round-trips
- `Promise.all()` for parallel data loading

### Concise Logging
```javascript
// Scheduler log
"[AEGIS SCHEDULER] Check complete: 3 auto-reorders triggered, 12 skipped"

// Error log
"[AEGIS AUTO-REORDER ERROR] Cooldown period not elapsed"
```

## Testing

### Unit Tests

```javascript
// Test stock calculation
expect(calcStockPct(50, 100)).toBe(50);
expect(calcStockPct(20, 100)).toBe(20);

// Test threshold check
const item = { current_stock: 15, total_capacity: 100 };
expect(isStockBelowThreshold(item, 20)).toBe(true);
expect(isStockBelowThreshold(item, 10)).toBe(false);

// Test cooldown
const cooldown = await checkReorderCooldown(itemId, 60);
expect(cooldown.canReorder).toBe(true);
```

### Integration Tests

```javascript
// Test full auto-reorder flow
const result = await attemptAutoReorder(
  item, vendor, user, config,
  insertOrderFn, insertAuditFn, sendEmailFn
);

expect(result.success).toBe(true);
expect(result.order).toBeDefined();
expect(result.emailSent).toBe(true);
```

## Admin Dashboard Integration

### Auto-Reorder Settings Component
Located in `AutoReorderSettings.js`:
- Per-item configuration panel
- Real-time stock percentage display
- Mode selection dropdown
- Threshold slider (5-50%)
- Cooldown period input
- Save/Cancel actions

### Dashboard Metrics
```javascript
<Metric 
  label="Auto-Reorders" 
  value={reorderStats.totalAuto}
  icon="auto_retry"
/>
<Metric 
  label="Pending Orders" 
  value={reorderStats.totalPending}
  icon="pending_actions"
/>
```

## Production Checklist

- [ ] Database columns added to `food_items` and `vendors` tables
- [ ] EmailJS configured with valid credentials
- [ ] Vendor emails verified and stored in `vendors.email`
- [ ] Auto-reorder settings configured for each item
- [ ] Scheduler interval tuned for business needs (default 5 min)
- [ ] Audit logging verified
- [ ] Email templates tested
- [ ] Cooldown periods configured appropriately
- [ ] Monitoring and alerting set up

## Troubleshooting

### Orders Not Triggering

1. **Check auto_reorder flag**
   ```sql
   SELECT name, auto_reorder, current_stock, total_capacity 
   FROM food_items WHERE id = ?;
   ```

2. **Verify threshold**
   ```javascript
   const stockPct = (item.current_stock / item.total_capacity) * 100;
   console.log(`Stock: ${stockPct}%, Threshold: ${item.reorder_threshold_pct}%`);
   ```

3. **Check pending orders**
   ```javascript
   const pending = await getPendingOrders(itemId);
   console.log("Pending orders:", pending);
   ```

4. **Verify scheduler is running**
   ```javascript
   console.log(scheduler.getStatus());
   ```

### Emails Not Sending

1. **Verify EmailJS config**
   ```javascript
   const config = loadEmailConfig();
   console.log("EmailJS configured:", config.enabled);
   ```

2. **Check vendor email**
   ```sql
   SELECT name, email FROM vendors WHERE id = ?;
   ```

3. **Check email logs**
   - View "Email Log" tab in admin dashboard
   - Look for error messages and retry status

### Duplicate Orders

1. **Verify cooldown settings**
   ```javascript
   const cooldown = await checkReorderCooldown(itemId, 60);
   console.log("Can reorder:", cooldown.canReorder);
   ```

2. **Check pending orders are being tracked**
   ```javascript
   const pending = await getPendingOrders(itemId);
   console.log("Pending count:", pending.length);
   ```

## Performance Considerations

- Scheduler runs every 5 minutes (adjustable)
- Batch processing all items in single operation
- Database queries use parallel `Promise.all()`
- Email sending is non-blocking
- Minimal state updates in React
- Efficient filtering and mapping

## Future Enhancements

1. **ML-based demand forecasting** - Predict reorder timing
2. **Vendor SLA tracking** - Monitor vendor delivery times
3. **Dynamic threshold adjustment** - Adapt based on usage patterns
4. **Bulk ordering** - Combine orders for same vendor
5. **Reorder history analytics** - Dashboard insights
6. **Order approval workflow** - Multi-level approvals for high-value items

