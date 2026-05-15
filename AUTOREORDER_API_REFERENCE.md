#!/bin/bash

# Intelligent Inventory Auto-Reorder System - Quick API Reference

## Service Functions Quick Reference

### ============================================
### reorderService.js - Core Business Logic
### ============================================

## Stock Calculations
# ├─ calcStockPct(current, max) → number
#   └─ Calculate stock percentage (0-100)
#   Usage: const pct = calcStockPct(50, 100); // returns 50

# ├─ isStockBelowThreshold(item, threshold) → boolean
#   └─ Check if stock is below threshold
#   Usage: if (isStockBelowThreshold(item, 20)) { reorder() }

# └─ calcReorderQty(item, bufferPercent) → number
#    └─ Calculate recommended reorder quantity
#    Usage: const qty = calcReorderQty(item, 80); // 80% buffer


## Duplicate Prevention
# ├─ getPendingOrders(itemId) → Promise<Array>
#   └─ Get all pending orders for item
#   Usage: const pending = await getPendingOrders(42);

# └─ checkReorderCooldown(itemId, cooldownMinutes) → Promise<{canReorder, lastOrderTime}>
#    └─ Check if cooldown period has elapsed
#    Usage: const { canReorder } = await checkReorderCooldown(42, 60);


## Core Reorder Operations
# ├─ attemptAutoReorder(item, vendor, user, config, insertOrder, insertAudit, sendEmail)
#   └─ Full validation → order creation → audit → email
#   Returns: {success, order, error?, emailSent?, reorderQty?, stockPct?}
#   Usage:
#   const result = await attemptAutoReorder(
#     item, vendor, user, emailConfig,
#     insertOrderFn, insertAuditFn, sendEmailFn
#   );
#   if (result.success) console.log('Order created:', result.order.id);

# └─ processLowStockDetection(items, vendors, user, config, insertOrder, insertAudit, sendEmail)
#    └─ Batch process all items for auto-reorder
#    Returns: Array of results [{itemId, itemName, success, order?, error?}, ...]
#    Usage: Called by scheduler every 5 minutes


## Configuration Management
# └─ updateReorderSettings(itemId, {autoReorder, reorderMode, thresholdPercent, cooldownMinutes})
#    └─ Configure item-level auto-reorder settings
#    Usage:
#    await updateReorderSettings(42, {
#      autoReorder: true,
#      reorderMode: 'manual',
#      thresholdPercent: 20,
#      cooldownMinutes: 60
#    });


## Status & Monitoring
# └─ getReorderStatus(item, allOrders) → {autoReorderEnabled, mode, stockPct, belowThreshold, ...}
#    └─ Get comprehensive reorder status for display
#    Usage: const status = getReorderStatus(item, orders);


### ============================================
### lowStockScheduler.js - Periodic Monitoring
### ============================================

## Scheduler Creation
# └─ createLowStockScheduler(intervalMinutes = 5) → LowStockScheduler
#    └─ Factory function to create scheduler instance
#    Usage: const scheduler = createLowStockScheduler(5);

## Scheduler Operations
# ├─ scheduler.start(checkFunction) → void
#   └─ Start periodic checks
#   Usage: scheduler.start(async () => { /* check logic */ });

# ├─ scheduler.stop() → void
#   └─ Stop periodic checks
#   Usage: scheduler.stop();

# └─ scheduler.getStatus() → {isRunning, intervalMinutes, lastRun, runCount}
#    └─ Get scheduler status information
#    Usage: console.log(scheduler.getStatus());


### ============================================
### emailService.js - Vendor Notifications
### ============================================

## Email Configuration
# ├─ loadEmailConfig() → {serviceId, templateId, publicKey, enabled}
#   └─ Load EmailJS config from localStorage
#   Usage: const config = loadEmailConfig();

# ├─ saveEmailConfig(config) → void
#   └─ Save EmailJS config to localStorage
#   Usage: saveEmailConfig({serviceId: "...", templateId: "...", publicKey: "..."});

# └─ sendVendorEmail(config, params) → Promise<{success, simulated?, message}>
#    └─ Core email sending function
#    Usage: const result = await sendVendorEmail(config, params);


## Email Notifications
# ├─ sendAutoReorderEmail(item, vendor, order, config)
#   └─ Send auto-reorder notification to vendor
#   Usage: await sendAutoReorderEmail(item, vendor, order, emailConfig);

# ├─ sendManualOrderEmail(item, vendor, order, user, config)
#   └─ Send manual order notification to vendor
#   Usage: await sendManualOrderEmail(item, vendor, order, user, emailConfig);

# └─ sendLowStockAlert(item, vendor, order, config)
#    └─ Send low-stock alert to vendor
#    Usage: await sendLowStockAlert(item, vendor, order, emailConfig);


### ============================================
### inventoryApi.js - Database Operations
### ============================================

## Vendor Management
# ├─ updateVendor(vendorId, {email, contact_name, phone}) → Promise<Object>
#   └─ Update vendor contact information
#   Usage: await updateVendor(1, {email: "vendor@example.com"});

# └─ getVendor(vendorId) → Promise<Object>
#    └─ Retrieve vendor details
#    Usage: const vendor = await getVendor(1);


## Order Queries
# ├─ insertOrder(order) → Promise<Object>
#   └─ Create new order
#   Usage: const order = await insertOrder({...});

# ├─ updateOrder(orderId, values) → Promise<Object>
#   └─ Update order status/details
#   Usage: await updateOrder(42, {status: 'Order Placed'});

# └─ getOrdersWithDetails(filters) → Promise<Array>
#    └─ Get orders with joined item and vendor data
#    Usage: const orders = await getOrdersWithDetails({status: 'Pending'});


## Statistics & Monitoring
# ├─ getReorderStats() → Promise<{totalAuto, totalManual, totalPending, itemsWithAutoReorder}>
#   └─ Get auto-reorder statistics
#   Usage: const stats = await getReorderStats();

# ├─ updateFoodItem(itemId, values) → Promise<Object>
#   └─ Update food item (stock, settings, etc.)
#   Usage: await updateFoodItem(42, {current_stock: 100});

# └─ insertAuditEntry(entry) → Promise<Object>
#    └─ Create audit log entry
#    Usage: await insertAuditEntry({food_item_id, action, qty, by_name, notes, ts});


### ============================================
### AutoReorderSettings Component
### ============================================

# Props:
# ├─ item (Object) - Food item with reorder settings
# ├─ vendors (Array) - Available vendors
# ├─ onUpdate (Function) - Callback when settings saved
# └─ disabled (Boolean) - Disable form editing

# Usage:
# <AutoReorderSettings
#   item={item}
#   vendors={vendors}
#   onUpdate={handleUpdate}
#   disabled={busy}
# />


### ============================================
### Database Schema
### ============================================

# food_items table additions:
# ├─ auto_reorder BOOLEAN DEFAULT true
# ├─ reorder_mode TEXT CHECK (IN ('manual', 'auto')) DEFAULT 'manual'
# ├─ reorder_threshold_pct INTEGER DEFAULT 20 CHECK (>= 5 AND <= 50)
# └─ reorder_cooldown_mins INTEGER DEFAULT 60 CHECK (>= 15 AND <= 1440)

# vendors table additions:
# ├─ email TEXT UNIQUE
# ├─ contact_name TEXT
# └─ phone TEXT

# Indexes:
# ├─ idx_orders_status
# ├─ idx_orders_trigger_type
# ├─ idx_orders_created_at
# ├─ idx_food_items_auto_reorder
# └─ idx_food_items_stock_level

# Views:
# └─ reorder_status - Comprehensive monitoring view


### ============================================
### Common Usage Patterns
### ============================================

## Pattern 1: Check and reorder single item
# const status = getReorderStatus(item, orders);
# if (status.belowThreshold && !status.hasPendingOrder) {
#   const result = await attemptAutoReorder(...);
# }

## Pattern 2: Batch check all items
# const results = await processLowStockDetection(
#   items, vendors, user, emailConfig,
#   insertOrder, insertAudit, sendEmail
# );
# const triggered = results.filter(r => r.success);

## Pattern 3: Configure item for auto-reorder
# await updateReorderSettings(itemId, {
#   autoReorder: true,
#   reorderMode: 'manual',
#   thresholdPercent: 20,
#   cooldownMinutes: 60
# });

## Pattern 4: Start monitoring
# const scheduler = createLowStockScheduler(5);
# scheduler.start(async () => {
#   return await processLowStockDetection(...);
# });

## Pattern 5: Handle reorder result
# const result = await attemptAutoReorder(...);
# if (result.success) {
#   showToast(`Order created: REQ-${result.order.id}`);
#   if (result.emailSent) showToast('Vendor notified');
# } else {
#   showToast(`Reorder blocked: ${result.error}`);
# }


### ============================================
### Error Handling
### ============================================

# Try/catch pattern:
# try {
#   const result = await attemptAutoReorder(...);
#   if (!result.success) {
#     console.error('Reorder failed:', result.error);
#   }
# } catch (err) {
#   console.error('[AUTO-REORDER ERROR]', err.message);
# }

# Common errors:
# ├─ "Auto-reorder disabled for this item"
# ├─ "Stock above threshold"
# ├─ "Pending order exists for this item"
# ├─ "Cooldown period not elapsed"
# └─ "Email send failed"


### ============================================
### Debugging Tips
### ============================================

# 1. Check scheduler status
# console.log(scheduler?.getStatus());

# 2. Get item reorder status
# console.log(getReorderStatus(item, orders));

# 3. Check pending orders
# const pending = await getPendingOrders(itemId);
# console.log('Pending orders:', pending);

# 4. Verify cooldown
# const cooldown = await checkReorderCooldown(itemId, 60);
# console.log('Can reorder:', cooldown.canReorder);

# 5. Check email config
# const config = loadEmailConfig();
# console.log('EmailJS ready:', config.serviceId && config.templateId);

# 6. View email log
# In app: Settings → Email Configuration → Email Log

# 7. Check database directly
# SELECT * FROM reorder_status ORDER BY stock_pct ASC;

# 8. Verify vendor emails
# SELECT name, email FROM vendors WHERE email IS NOT NULL;


### ============================================
### Production Checklist
### ============================================

# Setup:
# ☐ Database migrations executed
# ☐ Vendor emails populated
# ☐ EmailJS configured
# ☐ Auto-reorder enabled on items
# ☐ Scheduler interval set
# ☐ Admin user configured

# Testing:
# ☐ Create test order
# ☐ Email notification sent
# ☐ Audit entry logged
# ☐ Duplicate prevention works
# ☐ Cooldown prevents duplicates
# ☐ Pending orders block reorder

# Monitoring:
# ☐ Dashboard metrics displaying
# ☐ Email log recording
# ☐ Audit trail complete
# ☐ No console errors
# ☐ Performance acceptable

# Documentation:
# ☐ Team trained
# ☐ Admin manual provided
# ☐ Vendor emails sent
# ☐ Support contacts documented
# ☐ Escalation procedures ready


### ============================================
### Support Resources
### ============================================

# Documentation:
# ├─ AUTOREORDER_DOCS.md (Technical Reference)
# ├─ AUTOREORDER_SETUP_GUIDE.md (Implementation Guide)
# ├─ AUTOREORDER_IMPLEMENTATION_SUMMARY.md (Overview)
# ├─ AUTOREORDER_MIGRATIONS.sql (Database)
# └─ AUTOREORDER_API_REFERENCE.md (This file)

# Code Files:
# ├─ src/services/reorderService.js
# ├─ src/services/lowStockScheduler.js
# ├─ src/services/emailService.js (enhanced)
# ├─ src/services/inventoryApi.js (enhanced)
# └─ src/components/AutoReorderSettings.js

# Support:
# ├─ Browser Console (F12) for errors
# ├─ Supabase Dashboard for data
# ├─ EmailJS Dashboard for email logs
# └─ Application Email Log tab

