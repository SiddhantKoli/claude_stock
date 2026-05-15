/**
 * AutoReorderSettings.js
 * Admin panel for configuring auto-reorder system settings per item
 */

import React, { useState } from "react";
import { getReorderStatus } from "../services/reorderService";

export function AutoReorderSettings({ item, vendors, onUpdate, disabled }) {
  const vendor = vendors.find((v) => v.id === item.vendor_id);
  const [expanded, setExpanded] = useState(false);

  const [autoReorder, setAutoReorder] = useState(item.auto_reorder !== false);
  const [reorderMode, setReorderMode] = useState(item.reorder_mode || "manual");
  const [thresholdPercent, setThresholdPercent] = useState(item.reorder_threshold_pct || 20);
  const [cooldownMinutes, setCooldownMinutes] = useState(item.reorder_cooldown_mins || 60);

  const reorderStatus = getReorderStatus(item, []);

  const handleSave = async () => {
    try {
      await onUpdate({
        autoReorder,
        reorderMode,
        thresholdPercent: parseInt(thresholdPercent),
        cooldownMinutes: parseInt(cooldownMinutes),
      });
    } catch (err) {
      console.error("Error updating reorder settings:", err);
    }
  };

  const stockColor =
    reorderStatus.stockPct <= 20
      ? "danger"
      : reorderStatus.stockPct <= 55
        ? "warning"
        : "success";

  return (
    <div className="reorder-settings-panel">
      <div
        className="settings-header"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: "pointer", padding: "12px", borderBottom: "1px solid #e0e0e0" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h4 style={{ margin: 0, marginBottom: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8 }}>
                auto_retry
              </span>
              Auto-Reorder Configuration
            </h4>
            <small style={{ color: "#666" }}>
              {item.name} • Vendor: {vendor?.name || "Unassigned"}
            </small>
          </div>
          <span
            className="material-symbols-outlined"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            expand_more
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: 16 }}>
          {/* Stock Status */}
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#f5f5f5",
              borderRadius: 6,
              borderLeft: `4px solid ${
                stockColor === "danger" ? "#f44336" : stockColor === "warning" ? "#ff9800" : "#4caf50"
              }`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Current Status</span>
              <span className={`status-chip ${stockColor}-bg`}>
                {reorderStatus.stockPct}% Stock
              </span>
            </div>
            <small>
              {reorderStatus.belowThreshold && (
                <span style={{ color: "#f44336" }}>⚠ Below threshold ({reorderStatus.thresholdPercent}%)</span>
              )}
              {reorderStatus.hasPendingOrder && (
                <span style={{ color: "#2196f3", display: "block", marginTop: 4 }}>
                  ⏳ Pending order exists
                </span>
              )}
            </small>
          </div>

          {/* Settings Form */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Auto-Reorder Toggle */}
            <div>
              <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={autoReorder}
                  onChange={(e) => setAutoReorder(e.target.checked)}
                  disabled={disabled}
                  style={{ marginRight: 8, width: 18, height: 18, cursor: "pointer" }}
                />
                <span>
                  Enable Auto-Reorder
                  <br />
                  <small style={{ color: "#666" }}>Automatically trigger orders when stock is low</small>
                </span>
              </label>
            </div>

            {/* Reorder Mode */}
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                Reorder Mode
              </label>
              <select
                value={reorderMode}
                onChange={(e) => setReorderMode(e.target.value)}
                disabled={!autoReorder || disabled}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  opacity: !autoReorder ? 0.5 : 1,
                }}
              >
                <option value="manual">Manual Approval (Pending)</option>
                <option value="auto">Fully Automatic (Auto-Confirm)</option>
              </select>
              <small style={{ color: "#666", display: "block", marginTop: 4 }}>
                {reorderMode === "manual"
                  ? "Admin reviews before approval"
                  : "Orders confirmed immediately"}
              </small>
            </div>

            {/* Threshold Percentage */}
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                Stock Threshold (%): {thresholdPercent}%
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={thresholdPercent}
                onChange={(e) => setThresholdPercent(parseInt(e.target.value))}
                disabled={!autoReorder || disabled}
                style={{ width: "100%", opacity: !autoReorder ? 0.5 : 1 }}
              />
              <small style={{ color: "#666" }}>Trigger reorder when stock falls below this %</small>
            </div>

            {/* Cooldown Period */}
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                Cooldown Period: {cooldownMinutes} min
              </label>
              <input
                type="number"
                min="15"
                max="1440"
                step="15"
                value={cooldownMinutes}
                onChange={(e) => setCooldownMinutes(parseInt(e.target.value))}
                disabled={!autoReorder || disabled}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  opacity: !autoReorder ? 0.5 : 1,
                }}
              />
              <small style={{ color: "#666" }}>Minimum time between consecutive auto-reorders</small>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => setExpanded(false)}
              disabled={disabled}
              style={{
                padding: "8px 16px",
                border: "1px solid #ddd",
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={disabled}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Save Settings
            </button>
          </div>

          {/* Info Box */}
          <div
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#e3f2fd",
              borderRadius: 6,
              borderLeft: "4px solid #2196f3",
              fontSize: 12,
            }}
          >
            <strong>ℹ Info:</strong> Auto-reorder will check stock every 5 minutes. Orders are marked as "Pending"
            in {reorderMode === "manual" ? "manual mode" : "auto mode"}.
          </div>
        </div>
      )}
    </div>
  );
}

export default AutoReorderSettings;
