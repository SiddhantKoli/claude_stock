import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  insertAuditEntry,
  insertCheckoutLog,
  insertFoodItem,
  insertOrder,
  loadInventoryData,
  updateFoodItem,
  updateOrder,
  deleteFoodItem,
} from "./services/inventoryApi";
import { stockPct, daysUntilExpiry, fmt } from "./utils/helpers";

const CATEGORIES = [
  "All",
  "Rations",
  "Canned",
  "Frozen",
  "Beverages",
  "Dry Goods",
  "Perishables",
  "Maintenance",
];
const PRIORITIES = ["All", "Critical", "High", "Normal"];
const UNITS = ["kg", "litres", "packets", "cans", "boxes", "kits", "cells", "crates"];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=640&h=420&fit=crop";

const iconForCategory = (category = "") => ({
  Rations: "lunch_dining",
  Canned: "inventory_2",
  Frozen: "ac_unit",
  Beverages: "water_drop",
  "Dry Goods": "grain",
  Perishables: "bakery_dining",
  Maintenance: "construction",
}[category] || "inventory_2");

const priorityClass = (priority) =>
  priority === "Critical" ? "danger" : priority === "High" ? "warn" : "ok";

const statusClass = (status) =>
  status === "Delivered" ? "ok" :
  status === "Pending" ? "danger" :
  status === "Rejected" ? "danger" :
  status === "In Transit" ? "info" : "muted";

const displayAssetId = (item) => item?.asset_uid || item?.barcode || `ASSET-${item?.id}`;

function LoginScreen({ loginForm, setLoginForm, handleLogin, loading, error, rememberMe, setRememberMe, availableUsers }) {
  return (
    <div className="login-shell">
      <header className="login-brand">
        <div className="brand-mark"><span className="material-symbols-outlined">security</span></div>
        <h1>Aegis Logistics</h1>
        <p>GLOBAL SECURE ASSET MANAGEMENT</p>
      </header>

      <main className="login-card">
        <div className="top-rule" />
        <div className="section-heading">
          <h2>Secure Access Portal</h2>
          <p>Select your credentials to proceed</p>
        </div>

        <label className="field-label"><span className="material-symbols-outlined">person</span> SELECT OPERATOR</label>
        <select
          className="field"
          value={loginForm.email}
          onChange={(e) => {
            const user = availableUsers.find(u => u.email === e.target.value);
            if (user) {
              setLoginForm({ email: user.email, password: user.password });
            }
          }}
        >
          <option value="">-- Select a credential set --</option>
          {availableUsers.map((user) => (
            <option key={user.email} value={user.email}>
              {user.name || user.email} ({user.role?.toUpperCase()})
            </option>
          ))}
        </select>

        <label className="remember-checkbox">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          <span>Remember this selection</span>
        </label>

        {error && <div className="inline-alert danger">{error}</div>}

        <button className="primary-action" onClick={handleLogin} disabled={loading || !loginForm.email}>
          <span className="material-symbols-outlined">login</span>
          {loading ? "SYNCING DATABASE" : "AUTHENTICATE & ENTER"}
        </button>

        <div className="credential-block">
          <span>AVAILABLE ROLES</span>
          <p><span className="role-badge admin">ADMIN</span> Full system access & inventory control</p>
          <p><span className="role-badge officer">OFFICER</span> Operational deployment & logistics</p>
          <p><span className="role-badge vendor">VENDOR</span> Order fulfillment & tracking</p>
        </div>
      </main>

      <footer className="login-footer">
        <div><strong>AES-256 ENCRYPTED</strong><span>Command stream audit active</span></div>
        <div><strong>SYSTEM v4.2</strong><span>Supabase live sync online</span></div>
        <div><strong>ACCESS POLICY</strong><span>All stock actions are logged</span></div>
      </footer>
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab, user, setUser }) {
  const tabs = [
    ["dashboard", "dashboard", "Dashboard"],
    ["inventory", "inventory_2", "Inventory"],
    ["orders", "receipt_long", "Order Management"],
    ["audit", "history_edu", "Audit Trail"],
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Aegis Logistics</h1>
        <p>Command Center v4.2</p>
      </div>
      <nav>
        {tabs.map(([id, icon, label]) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="deploy-button">DEPLOY REPORT</button>
        <button className="nav-item support"><span className="material-symbols-outlined">help</span>Support</button>
        <button className="nav-item support" onClick={() => setUser(null)}>
          <span className="material-symbols-outlined">logout</span>Log Out
        </button>
        <div className="operator-mini">
          <span>{user?.name}</span>
          <small>{user?.role?.toUpperCase()}</small>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ search, setSearch, user, lowCount }) {
  return (
    <header className="topbar">
      <div className="searchbox">
        <span className="material-symbols-outlined">search</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Global asset tracking..." />
      </div>
      <div className="topbar-actions">
        <button className="icon-button"><span className="material-symbols-outlined">notifications</span>{lowCount > 0 && <b>{lowCount}</b>}</button>
        <button className="icon-button"><span className="material-symbols-outlined">settings</span></button>
        <div className="operator">
          <div><strong>{user?.name}</strong><span>{user?.role} node</span></div>
          <span className="avatar material-symbols-outlined">person</span>
        </div>
      </div>
    </header>
  );
}

function Metric({ label, value, icon, tone = "neutral", sub }) {
  return (
    <div className={`metric ${tone}`}>
      <div><span>{label}</span><span className="material-symbols-outlined">{icon}</span></div>
      <strong>{value}</strong>
      <p>{sub}</p>
    </div>
  );
}

function Dashboard({ items, orders, vendors, onManualOrder, onDeliveryConfirm }) {
  const branches = [...new Set(items.map((i) => i.branch))];
  const lowStock = items.filter((i) => stockPct(i) <= (i.priority === "Critical" ? 30 : 20));
  const expiring = items.filter((i) => i.expiry_date && daysUntilExpiry(i.expiry_date) <= 30);
  const activeOrders = orders.filter((o) => o.status !== "Delivered" && o.status !== "Rejected");
  const priorityCounts = ["Critical", "High", "Normal"].map((p) => ({
    priority: p,
    total: items.filter((i) => i.priority === p).length,
  }));

  return (
    <div className="page-stack">
      <div className="metrics-grid">
        <Metric label="Total Assets" value={items.length.toLocaleString()} icon="inventory" sub="LIVE FROM SUPABASE" />
        <Metric label="Critical Low" value={lowStock.filter((i) => i.priority === "Critical").length} icon="warning" tone="danger" sub="ACTION REQUIRED" />
        <Metric label="Pending Orders" value={activeOrders.length} icon="local_shipping" tone="info" sub="REQUISITIONS OPEN" />
        <Metric label="Expiring Soon" value={expiring.length} icon="schedule" tone="warn" sub="WITHIN 30 DAYS" />
      </div>

      <div className="dashboard-grid">
        <section className="panel span-8">
          <div className="panel-head">
            <h2>BRANCH STOCK HEALTH</h2>
            <div className="legend"><span className="ok-dot" />OPTIMAL<span className="warn-dot" />WARNING<span className="danger-dot" />CRITICAL</div>
          </div>
          <div className="readiness-list">
            {branches.map((branch) => {
              const branchItems = items.filter((i) => i.branch === branch);
              const current = branchItems.reduce((sum, i) => sum + i.current_stock, 0);
              const total = branchItems.reduce((sum, i) => sum + i.total_capacity, 0);
              const pct = total ? Math.round((current / total) * 100) : 0;
              return (
                <div className="readiness" key={branch}>
                  <div><strong>{branch.toUpperCase()} COMMAND</strong><span>{pct}%</span></div>
                  <div className="rail"><i className={pct < 25 ? "danger-bg" : pct < 70 ? "warn-bg" : ""} style={{ width: `${pct}%` }} /></div>
                  <footer><span>READINESS: {pct < 25 ? "CRITICAL" : pct < 70 ? "MARGINAL" : "NOMINAL"}</span><span>{current.toLocaleString()} / {total.toLocaleString()} UNITS</span></footer>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel span-4">
          <div className="panel-head"><h2>STOCK BY PRIORITY</h2></div>
          <div className="priority-stack">
            {priorityCounts.map((row) => (
              <div className={`priority-row ${priorityClass(row.priority)}`} key={row.priority}>
                <i />
                <div><span>{row.priority === "Normal" ? "PRIORITY 3 (ROUTINE)" : `PRIORITY ${row.priority === "Critical" ? "1" : "2"} (${row.priority.toUpperCase()})`}</span><b>{String(row.total).padStart(2, "0")}</b><p>{row.priority === "Critical" ? "REPLENISHMENT MANDATORY" : row.priority === "High" ? "REORDER CYCLE PENDING" : "AUTONOMOUS RESTOCK ACTIVE"}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel span-8 no-pad">
          <div className="table-title">
            <h2>Critical Low Stock Quick-Actions</h2>
            <span className="status-chip danger">{lowStock.length} IMMEDIATE THREATS</span>
          </div>
          <DataTable
            columns={["Asset ID", "Nomenclature", "Qty", "Min Threshold", "Branch", "Actions"]}
            rows={lowStock.slice(0, 8).map((item) => [
              <span className="mono primary-text">{displayAssetId(item)}</span>,
              item.name,
              <span className="mono danger-text">{item.current_stock}</span>,
              <span className="mono">{item.min_required}</span>,
              <span className="status-chip muted">{item.branch}</span>,
              <button className="table-action" onClick={() => onManualOrder(item)}>ORDER NOW</button>,
            ])}
            empty="No critical stock exceptions."
          />
        </section>

        <section className="panel span-12">
          <div className="panel-head"><h2>LOGISTICS TIMELINE</h2></div>
          <div className="timeline">
            {activeOrders.slice(0, 4).map((order) => {
              const item = items.find((i) => i.id === order.food_item_id);
              const vendor = vendors.find((v) => v.id === order.vendor_id);
              return (
                <div className={`timeline-row ${statusClass(order.status)}`} key={order.id}>
                  <time>{new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                  <p>{item?.name || "Unknown asset"} requisition is {order.status.toLowerCase()} via {vendor?.name || "assigned vendor"}.</p>
                  {(order.status === "Order Placed" || order.status === "In Transit") && <button onClick={() => onDeliveryConfirm(order)}>Confirm Delivery</button>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Inventory({ items, locations, vendors, user, filters, setFilters, onCheckout, onRestock, onDelete, onAddItem }) {
  const branchOptions = ["All", ...new Set(items.map((i) => i.branch))];

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div><h2>Inventory Management</h2><p>Real-time resource allocation and stock monitoring for Sector 7G.</p></div>
        <div className="telemetry-pair">
          <Metric label="Total SKU" value={items.length} icon="tag" />
          <Metric label="Low Rate" value={`${items.filter((i) => stockPct(i) <= 20).length}`} icon="warning" tone="danger" />
        </div>
      </div>

      <div className="filter-tabs">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={filters.category === cat ? "active" : ""} onClick={() => setFilters((p) => ({ ...p, category: cat }))}>
            {cat === "All" ? "ALL CATEGORIES" : cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <select value={filters.branch} onChange={(e) => setFilters((p) => ({ ...p, branch: e.target.value }))}>{branchOptions.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={filters.priority} onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value }))}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
        <select value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}>
          <option value="All">All Locations</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        {(user.role === "admin" || user.role === "officer") && <button className="primary-small" onClick={onAddItem}><span className="material-symbols-outlined">add</span>ADD ASSET</button>}
      </div>

      <div className="asset-grid">
        {items.map((item) => {
          const loc = locations.find((l) => l.id === item.location_id);
          const vendor = vendors.find((v) => v.id === item.vendor_id);
          const pct = stockPct(item);
          return (
            <article className="asset-card" key={item.id}>
              <div className="asset-image">
                <img alt={item.name} src={item.image_url || FALLBACK_IMAGE} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} />
                <span className={`status-chip ${priorityClass(item.priority)}`}>{item.priority.toUpperCase()}</span>
              </div>
              <div className="asset-body">
                <header><h3>{item.name}</h3><span className="mono">ID: {displayAssetId(item)}</span></header>
                <div className="stock-row"><span>STOCK LEVEL</span><b>{item.current_stock.toLocaleString()} / {item.total_capacity.toLocaleString()} {item.unit}</b></div>
                <div className="rail slim"><i className={pct <= 20 ? "danger-bg" : pct <= 55 ? "warn-bg" : ""} style={{ width: `${Math.min(100, pct)}%` }} /></div>
                <footer><span>Exp: {item.expiry_date ? fmt(item.expiry_date) : "N/A"}</span><span>Loc: {loc?.name || "N/A"}</span></footer>
                <small>{vendor?.name || "Unassigned"} | {item.sector || "Sector 7G"}</small>
              </div>
              {user.role !== "vendor" && (
                <div className="asset-actions">
                  <button onClick={() => onRestock(item)}>RESTOCK</button>
                  <button onClick={() => onCheckout(item)}>CHECKOUT</button>
                  {user.role === "admin" && <button className="danger-action" onClick={() => onDelete(item)}>DELETE</button>}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Orders({ orders, items, vendors, user, onDeliveryConfirm, onVendorConfirm }) {
  const visibleOrders = user.role === "vendor" ? orders.filter((o) => o.vendor_id === user.vendor_id) : orders;
  const totalVolume = visibleOrders.reduce((sum, o) => sum + Number(o.quantity_requested || 0), 0);
  const transit = visibleOrders.filter((o) => o.status === "In Transit" || o.status === "Order Placed").length;
  const pending = visibleOrders.filter((o) => o.status === "Pending").length;

  return (
    <div className="page-stack">
      <div className="order-hero">
        <div><h1>{user.role === "vendor" ? "Vendor Requisition Queue" : "Active Requisitions"}</h1><p>Procurement operations are synchronized against Supabase in real time.</p></div>
        <div><span>SYSTEM STATUS</span><strong>OPERATIONAL</strong></div>
      </div>
      <div className="metrics-grid compact">
        <Metric label="Total Volume" value={totalVolume.toLocaleString()} icon="scale" sub="UNITS REQUESTED" />
        <Metric label="Transit" value={transit} icon="local_shipping" tone="info" sub="MOVING OR CONFIRMED" />
        <Metric label="Pending" value={pending} icon="pending_actions" tone="danger" sub="AWAITING VENDOR" />
      </div>
      <section className="panel no-pad">
        <div className="table-title">
          <h2>Orders Data Table</h2>
          <button className="table-action">GENERATE MANIFEST</button>
        </div>
        <DataTable
          columns={["Requisition ID", "Commodity", "Vendor", "Quantity", "Timestamp", "Status", "Actions"]}
          rows={visibleOrders.map((order) => {
            const item = items.find((i) => i.id === order.food_item_id);
            const vendor = vendors.find((v) => v.id === order.vendor_id);
            return [
              <span className="mono primary-text">#REQ-{String(order.id).padStart(4, "0")}</span>,
              <span className="commodity"><span className="material-symbols-outlined">{iconForCategory(item?.category)}</span>{item?.name || "Unknown asset"}</span>,
              vendor?.name || "Unassigned",
              <span className="mono">{order.quantity_requested} {item?.unit}</span>,
              <span className="mono muted-text">{new Date(order.created_at).toLocaleString()}</span>,
              <span className={`status-chip ${statusClass(order.status)}`}>{order.status.toUpperCase()}</span>,
              user.role === "vendor" && order.status === "Pending" ? (
                <button className="table-action" onClick={() => onVendorConfirm(order)}>CONFIRM ORDER</button>
              ) : (order.status === "Order Placed" || order.status === "In Transit") ? (
                <button className="table-action" onClick={() => onDeliveryConfirm(order)}>CONFIRM DELIVERY</button>
              ) : (
                <span className="muted-text">LOCKED</span>
              ),
            ];
          })}
          empty="No requisitions found."
        />
      </section>
    </div>
  );
}

function Audit({ audit, logs, items }) {
  const rows = audit.map((entry) => {
    const item = items.find((i) => i.id === entry.food_item_id);
    const signedQty = entry.action === "Removed" ? `-${String(entry.qty).padStart(3, "0")}` : `+${String(entry.qty).padStart(3, "0")}`;
    return [
      <span className="mono muted-text">{new Date(entry.ts).toLocaleString()}</span>,
      <strong>{displayAssetId(item)}</strong>,
      <span className={`status-chip ${entry.action === "Removed" ? "danger" : entry.action === "Ordered" ? "info" : "ok"}`}>{entry.action}</span>,
      <span className={`mono ${entry.action === "Removed" ? "danger-text" : "primary-text"}`}>{signedQty}</span>,
      entry.by,
      <em>{entry.notes || item?.name || "Stock event"}</em>,
    ];
  });

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div><h2>Stock Audit Trail Ledger</h2><p>Every checkout, restock, order, and delivery confirmation is persisted in Supabase.</p></div>
        <div className="telemetry-pair">
          <Metric label="Audit Events" value={audit.length} icon="database" />
          <Metric label="Checkout Logs" value={logs.length} icon="archive" />
        </div>
      </div>
      <section className="panel no-pad">
        <div className="table-title">
          <h2><span className="material-symbols-outlined">database</span> Stock Audit Trail Ledger</h2>
          <button className="table-action">EXPORT LEDGER</button>
        </div>
        <DataTable columns={["Timestamp", "Asset UID", "Action", "Qty", "Operator", "Terminal / Notes"]} rows={rows} empty="No audit entries yet." />
      </section>
      <div className="sync-strip">
        <span><i /> DATABASE SYNC: ONLINE</span>
        <span><span className="material-symbols-outlined">speed</span> THROUGHPUT: LIVE</span>
        <span><span className="material-symbols-outlined">lock</span> ENCRYPTION: AES-256</span>
      </div>
    </div>
  );
}

function DataTable({ columns, rows, empty }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="empty-cell">{empty}</td></tr>
          ) : rows.map((row, idx) => (
            <tr key={idx}>{row.map((cell, cellIdx) => <td key={cellIdx}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <header><h2>{title}</h2><button onClick={onClose}><span className="material-symbols-outlined">close</span></button></header>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState({ locations: [], vendors: [], users: [], items: [], orders: [], logs: [], audit: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [filters, setFilters] = useState({ category: "All", branch: "All", priority: "All", location: "All" });
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [formQty, setFormQty] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [newItem, setNewItem] = useState({
    asset_uid: "",
    name: "",
    category: "Rations",
    branch: "Army",
    location_id: 5,
    current_stock: 50,
    total_capacity: 100,
    unit: "kg",
    min_required: 20,
    priority: "Normal",
    vendor_id: 1,
    expiry_date: "",
    barcode: "",
    sector: "Sector 7G",
    image_url: "",
  });

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("aegis_login");
    if (saved) {
      try {
        const { email, password } = JSON.parse(saved);
        setLoginForm({ email, password });
        setRememberMe(true);
      } catch (e) {
        console.error("Failed to load saved credentials", e);
      }
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const live = await loadInventoryData();
      setData(live);
      setLoadError("");
    } catch (error) {
      setLoadError(error.message || "Unable to load Supabase inventory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };

  const handleLogin = () => {
    const found = data.users.find((u) => u.email === loginForm.email && u.password === loginForm.password);
    if (!found) {
      setLoadError("Invalid credentials or database users have not loaded yet.");
      return;
    }
    
    // Save credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem("aegis_login", JSON.stringify({ email: loginForm.email, password: loginForm.password }));
    } else {
      localStorage.removeItem("aegis_login");
    }
    
    setUser(found);
    setActiveTab(found.role === "vendor" ? "orders" : "dashboard");
    setLoadError("");
  };

  const addAudit = async (entry) => {
    const saved = await insertAuditEntry(entry);
    setData((p) => ({ ...p, audit: [saved, ...p.audit] }));
    return saved;
  };

  const checkLowStock = async (item) => {
    const pct = stockPct(item);
    const threshold = item.priority === "Critical" ? 30 : 20;
    if (pct > threshold) return;
    const existing = data.orders.find((o) => o.food_item_id === item.id && ["Pending", "Order Placed", "In Transit"].includes(o.status));
    if (existing) return;

    const order = await insertOrder({
      food_item_id: item.id,
      vendor_id: item.vendor_id,
      requested_by: user?.id || 1,
      quantity_requested: Math.max(1, item.total_capacity - item.current_stock),
      status: "Pending",
      trigger_type: "Auto",
      created_at: new Date().toISOString(),
      vendor_reply: "",
      eta: "",
    });
    setData((p) => ({ ...p, orders: [order, ...p.orders] }));
    await addAudit({
      food_item_id: item.id,
      action: "Ordered",
      qty: order.quantity_requested,
      by: "AEGIS_AUTO_REPLENISH",
      notes: `Auto trigger at ${pct}% stock.`,
      ts: new Date().toISOString(),
    });
  };

  const handleCheckout = async () => {
    if (!checkoutItem) return;
    const qty = Number(formQty);
    if (!qty || qty <= 0 || qty > checkoutItem.current_stock) return showToast("Enter a valid checkout quantity.");
    setBusy(true);
    try {
      const updated = await updateFoodItem(checkoutItem.id, { current_stock: checkoutItem.current_stock - qty });
      const log = await insertCheckoutLog({
        food_item_id: checkoutItem.id,
        officer_id: user.id,
        qty,
        reason: formNotes || "Operational deployment",
        timestamp: new Date().toISOString(),
        notes: formNotes || "",
      });
      await addAudit({
        food_item_id: checkoutItem.id,
        action: "Removed",
        qty,
        by: user.name,
        notes: formNotes || "Operational deployment",
        ts: new Date().toISOString(),
      });
      setData((p) => ({
        ...p,
        items: p.items.map((i) => i.id === updated.id ? updated : i),
        logs: [log, ...p.logs],
      }));
      await checkLowStock(updated);
      setCheckoutItem(null);
      setFormQty("");
      setFormNotes("");
      showToast("Checkout persisted to Supabase.");
    } catch (error) {
      showToast(error.message || "Checkout failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleRestock = async () => {
    if (!restockItem) return;
    const qty = Number(formQty);
    if (!qty || qty <= 0) return showToast("Enter a valid restock quantity.");
    setBusy(true);
    try {
      const updated = await updateFoodItem(restockItem.id, {
        current_stock: Math.min(restockItem.total_capacity, restockItem.current_stock + qty),
      });
      await addAudit({
        food_item_id: restockItem.id,
        action: "Added",
        qty,
        by: user.name,
        notes: formNotes || "Manual restock",
        ts: new Date().toISOString(),
      });
      setData((p) => ({ ...p, items: p.items.map((i) => i.id === updated.id ? updated : i) }));
      setRestockItem(null);
      setFormQty("");
      setFormNotes("");
      showToast("Restock persisted to Supabase.");
    } catch (error) {
      showToast(error.message || "Restock failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return showToast("Asset name is required.");
    setBusy(true);
    try {
      const saved = await insertFoodItem({
        ...newItem,
        location_id: Number(newItem.location_id),
        vendor_id: Number(newItem.vendor_id),
        current_stock: Number(newItem.current_stock),
        total_capacity: Number(newItem.total_capacity),
        min_required: Number(newItem.min_required),
        asset_uid: newItem.asset_uid || newItem.barcode || `AEGIS-${Date.now()}`,
        barcode: newItem.barcode || newItem.asset_uid || `AEGIS-${Date.now()}`,
        image_url: newItem.image_url || FALLBACK_IMAGE,
        expiry_date: newItem.expiry_date || null,
      });
      await addAudit({
        food_item_id: saved.id,
        action: "Added",
        qty: saved.current_stock,
        by: user.name,
        notes: "New strategic asset created.",
        ts: new Date().toISOString(),
      });
      setData((p) => ({ ...p, items: [saved, ...p.items] }));
      setAddItemOpen(false);
      showToast("New asset saved to Supabase.");
    } catch (error) {
      showToast(error.message || "Unable to add asset.");
    } finally {
      setBusy(false);
    }
  };

  const handleManualOrder = async (item) => {
    setBusy(true);
    try {
      const order = await insertOrder({
        food_item_id: item.id,
        vendor_id: item.vendor_id,
        requested_by: user.id,
        quantity_requested: Math.max(1, item.total_capacity - item.current_stock),
        status: "Pending",
        trigger_type: "Manual",
        created_at: new Date().toISOString(),
        vendor_reply: "",
        eta: "",
      });
      setData((p) => ({ ...p, orders: [order, ...p.orders] }));
      await addAudit({
        food_item_id: item.id,
        action: "Ordered",
        qty: order.quantity_requested,
        by: user.name,
        notes: "Manual requisition generated.",
        ts: new Date().toISOString(),
      });
      showToast("Manual requisition created.");
    } catch (error) {
      showToast(error.message || "Order failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeliveryConfirm = async (order) => {
    const item = data.items.find((i) => i.id === order.food_item_id);
    if (!item) return;
    setBusy(true);
    try {
      const updatedItem = await updateFoodItem(item.id, {
        current_stock: Math.min(item.total_capacity, item.current_stock + order.quantity_requested),
      });
      const updatedOrder = await updateOrder(order.id, { status: "Delivered" });
      await addAudit({
        food_item_id: item.id,
        action: "Delivered",
        qty: order.quantity_requested,
        by: user?.name || "AEGIS_OPERATOR",
        notes: "Delivery confirmed and stock updated.",
        ts: new Date().toISOString(),
      });
      setData((p) => ({
        ...p,
        items: p.items.map((i) => i.id === updatedItem.id ? updatedItem : i),
        orders: p.orders.map((o) => o.id === updatedOrder.id ? updatedOrder : o),
      }));
      showToast("Delivery confirmed in Supabase.");
    } catch (error) {
      showToast(error.message || "Delivery confirmation failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleVendorConfirm = async (order) => {
    setBusy(true);
    try {
      const eta = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
      const updatedOrder = await updateOrder(order.id, {
        status: "Order Placed",
        eta,
        vendor_reply: "Confirmed by vendor portal.",
      });
      const item = data.items.find((i) => i.id === order.food_item_id);
      await addAudit({
        food_item_id: order.food_item_id,
        action: "Ordered",
        qty: order.quantity_requested,
        by: user.name,
        notes: `Vendor confirmed requisition. ETA ${eta}.`,
        ts: new Date().toISOString(),
      });
      setData((p) => ({ ...p, orders: p.orders.map((o) => o.id === updatedOrder.id ? updatedOrder : o) }));
      showToast(`${item?.name || "Order"} confirmed by vendor.`);
    } catch (error) {
      showToast(error.message || "Vendor confirmation failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) return;
    setBusy(true);
    try {
      await addAudit({
        food_item_id: item.id,
        action: "Deleted",
        qty: item.current_stock,
        by: user.name,
        notes: "Asset permanently removed from inventory.",
        ts: new Date().toISOString(),
      });
      await deleteFoodItem(item.id);
      setData((p) => ({ ...p, items: p.items.filter((i) => i.id !== item.id) }));
      showToast(`${item.name} has been deleted from the inventory.`);
    } catch (error) {
      showToast(error.message || "Unable to delete asset.");
    } finally {
      setBusy(false);
    }
  };

  const filteredItems = useMemo(() => {
    const text = search.trim().toLowerCase();
    return data.items.filter((item) => {
      if (filters.category !== "All" && item.category !== filters.category) return false;
      if (filters.branch !== "All" && item.branch !== filters.branch) return false;
      if (filters.priority !== "All" && item.priority !== filters.priority) return false;
      if (filters.location !== "All" && item.location_id !== Number(filters.location)) return false;
      if (text && !`${item.name} ${item.asset_uid} ${item.barcode} ${item.category} ${item.branch}`.toLowerCase().includes(text)) return false;
      return true;
    });
  }, [data.items, filters, search, user]);

  const lowCount = data.items.filter((i) => stockPct(i) <= (i.priority === "Critical" ? 30 : 20)).length;

  if (!user) {
    return <LoginScreen loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={handleLogin} loading={loading} error={loadError} rememberMe={rememberMe} setRememberMe={setRememberMe} availableUsers={data.users} />;
  }

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} setUser={setUser} />
      <main className="main-shell">
        <Topbar search={search} setSearch={setSearch} user={user} lowCount={lowCount} />
        <section className="content">
          {loading && <div className="inline-alert">Synchronizing Supabase live data...</div>}
          {loadError && <div className="inline-alert danger">{loadError}</div>}
          {activeTab === "dashboard" && <Dashboard items={data.items} orders={data.orders} vendors={data.vendors} onManualOrder={handleManualOrder} onDeliveryConfirm={handleDeliveryConfirm} />}
          {activeTab === "inventory" && <Inventory items={filteredItems} locations={data.locations} vendors={data.vendors} user={user} filters={filters} setFilters={setFilters} onCheckout={setCheckoutItem} onRestock={setRestockItem} onDelete={handleDeleteItem} onAddItem={() => setAddItemOpen(true)} />}
          {activeTab === "orders" && <Orders orders={data.orders} items={data.items} vendors={data.vendors} user={user} onDeliveryConfirm={handleDeliveryConfirm} onVendorConfirm={handleVendorConfirm} />}
          {activeTab === "audit" && <Audit audit={data.audit} logs={data.logs} items={data.items} />}
        </section>
      </main>

      {(checkoutItem || restockItem) && (
        <Modal title={`${checkoutItem ? "Checkout" : "Restock"}: ${(checkoutItem || restockItem).name}`} onClose={() => { setCheckoutItem(null); setRestockItem(null); }}>
          <label className="field-label">QUANTITY</label>
          <input className="field" type="number" value={formQty} onChange={(e) => setFormQty(e.target.value)} />
          <label className="field-label">TERMINAL / NOTES</label>
          <textarea className="field textarea" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} />
          <button className="primary-action" disabled={busy} onClick={checkoutItem ? handleCheckout : handleRestock}>{busy ? "SAVING" : "CONFIRM TRANSACTION"}</button>
        </Modal>
      )}

      {addItemOpen && (
        <Modal title="Add Strategic Asset" onClose={() => setAddItemOpen(false)}>
          <div className="form-grid">
            {[
              ["name", "ASSET NAME", "text"],
              ["asset_uid", "ASSET UID", "text"],
              ["current_stock", "CURRENT STOCK", "number"],
              ["total_capacity", "TOTAL CAPACITY", "number"],
              ["min_required", "MIN THRESHOLD", "number"],
              ["expiry_date", "EXPIRY DATE", "date"],
              ["sector", "SECTOR", "text"],
              ["image_url", "IMAGE URL", "text"],
            ].map(([key, label, type]) => (
              <div key={key}>
                <label className="field-label">{label}</label>
                <input className="field" type={type} value={newItem[key]} onChange={(e) => setNewItem((p) => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <div><label className="field-label">CATEGORY</label><select className="field" value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}>{CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="field-label">PRIORITY</label><select className="field" value={newItem.priority} onChange={(e) => setNewItem((p) => ({ ...p, priority: e.target.value }))}>{PRIORITIES.filter((p) => p !== "All").map((p) => <option key={p}>{p}</option>)}</select></div>
            <div><label className="field-label">UNIT</label><select className="field" value={newItem.unit} onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
            <div><label className="field-label">LOCATION</label><select className="field" value={newItem.location_id} onChange={(e) => setNewItem((p) => ({ ...p, location_id: e.target.value, branch: data.locations.find((l) => l.id === Number(e.target.value))?.branch || p.branch }))}>{data.locations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.branch})</option>)}</select></div>
            <div><label className="field-label">VENDOR</label><select className="field" value={newItem.vendor_id} onChange={(e) => setNewItem((p) => ({ ...p, vendor_id: e.target.value }))}>{data.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
          </div>
          <button className="primary-action" disabled={busy} onClick={handleAddItem}>{busy ? "SAVING" : "ADD ASSET TO LIVE DATABASE"}</button>
        </Modal>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
