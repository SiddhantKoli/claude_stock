import { Modal, inputStyle, labelStyle } from "./Modal";
import { CATEGORIES, BRANCHES, PRIORITIES, LOCATIONS, VENDORS } from "../constants/data";

export const CheckoutModal = ({
  checkoutItem, checkoutForm, setCheckoutForm,
  handleCheckout, setCheckoutItem
}) => {
  if (!checkoutItem) return null;

  return (
    <Modal title={`Checkout: ${checkoutItem.name}`} onClose={() => setCheckoutItem(null)}>
      <div style={{
        color: "#64748b", fontSize: 12, marginBottom: 16
      }}>Available: {checkoutItem.current_stock} {checkoutItem.unit}</div>
      
      <label style={labelStyle}>Quantity to Remove *</label>
      <input type="number" style={inputStyle} value={checkoutForm.qty}
        onChange={e => setCheckoutForm(p => ({ ...p, qty: e.target.value }))}
        placeholder="Enter quantity" />
      
      <label style={labelStyle}>Reason *</label>
      <select style={inputStyle} value={checkoutForm.reason}
        onChange={e => setCheckoutForm(p => ({ ...p, reason: e.target.value }))}>
        {["Field Exercise", "Weekly Rations", "Medical Requirement", "Emergency Supply", "Inspection Loss", "Training", "Other"].map(r =>
          <option key={r}>{r}</option>
        )}
      </select>
      
      <label style={labelStyle}>Additional Notes</label>
      <textarea style={{ ...inputStyle, height: 70, resize: "vertical" }}
        value={checkoutForm.notes}
        onChange={e => setCheckoutForm(p => ({ ...p, notes: e.target.value }))}
        placeholder="Optional notes..." />
      
      <button onClick={handleCheckout} style={{
        width: "100%", padding: "12px", background: "#ef4444",
        border: "none", borderRadius: 8, color: "#fff", fontWeight: 700,
        fontSize: 14, cursor: "pointer"
      }}>
        Confirm Checkout
      </button>
    </Modal>
  );
};

export const RestockModal = ({
  restockItem, restockForm, setRestockForm,
  handleRestock, setRestockItem
}) => {
  if (!restockItem) return null;

  return (
    <Modal title={`Restock: ${restockItem.name}`} onClose={() => setRestockItem(null)}>
      <div style={{
        color: "#64748b", fontSize: 12, marginBottom: 16
      }}>Current: {restockItem.current_stock} / {restockItem.total_capacity} {restockItem.unit}</div>
      
      <label style={labelStyle}>Quantity to Add *</label>
      <input type="number" style={inputStyle} value={restockForm.qty}
        onChange={e => setRestockForm(p => ({ ...p, qty: e.target.value }))}
        placeholder="Enter quantity" />
      
      <label style={labelStyle}>Notes</label>
      <input style={inputStyle} value={restockForm.notes}
        onChange={e => setRestockForm(p => ({ ...p, notes: e.target.value }))}
        placeholder="Delivery notes, batch no..." />
      
      <button onClick={handleRestock} style={{
        width: "100%", padding: "12px", background: "#22c55e",
        border: "none", borderRadius: 8, color: "#052e16",
        fontWeight: 700, fontSize: 14, cursor: "pointer"
      }}>
        Confirm Restock
      </button>
    </Modal>
  );
};

export const AddItemModal = ({
  addItemModal, newItem, setNewItem,
  handleAddItem, setAddItemModal
}) => {
  if (!addItemModal) return null;

  return (
    <Modal title="Add New Food Item" onClose={() => setAddItemModal(false)}>
      {[
        { label: "Item Name *", key: "name", type: "text", placeholder: "e.g. Ready-to-Eat Meals" },
        { label: "Total Capacity *", key: "total_capacity", type: "number" },
        { label: "Current Stock *", key: "current_stock", type: "number" },
        { label: "Min Required *", key: "min_required", type: "number" },
        { label: "Expiry Date *", key: "expiry_date", type: "date" },
        { label: "Barcode", key: "barcode", type: "text", placeholder: "MIL-XXX-YYY" },
      ].map(f => (
        <div key={f.key}>
          <label style={labelStyle}>{f.label}</label>
          <input type={f.type} style={inputStyle} value={newItem[f.key]}
            placeholder={f.placeholder}
            onChange={e => setNewItem(p => ({ ...p, [f.key]: e.target.value }))} />
        </div>
      ))}
      
      {[
        { label: "Category", key: "category", options: CATEGORIES },
        { label: "Branch", key: "branch", options: BRANCHES },
        { label: "Priority", key: "priority", options: PRIORITIES },
        { label: "Unit", key: "unit", options: ["kg", "litres", "packets", "cans", "boxes"] },
      ].map(f => (
        <div key={f.key}>
          <label style={labelStyle}>{f.label}</label>
          <select style={inputStyle} value={newItem[f.key]}
            onChange={e => setNewItem(p => ({ ...p, [f.key]: e.target.value }))}>
            {f.options.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      ))}
      
      <label style={labelStyle}>Location</label>
      <select style={inputStyle} value={newItem.location_id}
        onChange={e => setNewItem(p => ({ ...p, location_id: e.target.value }))}>
        {LOCATIONS.map(l =>
          <option key={l.id} value={l.id}>{l.name} ({l.branch})</option>
        )}
      </select>
      
      <label style={labelStyle}>Vendor</label>
      <select style={inputStyle} value={newItem.vendor_id}
        onChange={e => setNewItem(p => ({ ...p, vendor_id: e.target.value }))}>
        {VENDORS.map(v =>
          <option key={v.id} value={v.id}>{v.name}</option>
        )}
      </select>
      
      <button onClick={handleAddItem} style={{
        width: "100%", padding: "12px", background: "#22c55e",
        border: "none", borderRadius: 8, color: "#052e16",
        fontWeight: 700, fontSize: 14, cursor: "pointer"
      }}>
        Add Item to Inventory
      </button>
    </Modal>
  );
};
