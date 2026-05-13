import { VENDORS, FOOD_IMAGES, LOCATIONS } from "../constants/data";
import { fmt, statusColor, elapsed } from "../utils/helpers";

export const OrdersView = ({
  orders, items, user, handleDeliveryConfirm,
  setOrders
}) => {
  return (
    <div>
      <div style={{
        color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 16
      }}>ALL ORDERS</div>
      {orders.map(order => {
        const item = items.find(i => i.id === order.food_item_id);
        const vendor = VENDORS.find(v => v.id === order.vendor_id);
        return (
          <div key={order.id} style={{
            background: "#0f172a", border: "1px solid #1e293b",
            borderRadius: 12, padding: 16, marginBottom: 12
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              flexWrap: "wrap", gap: 8
            }}>
              <div>
                <div style={{
                  color: "#f1f5f9", fontWeight: 700
                }}>{item?.name}</div>
                <div style={{
                  color: "#64748b", fontSize: 12
                }}>Vendor: {vendor?.name} • Qty: {order.quantity_requested} {item?.unit} • {elapsed(order.created_at)}</div>
                {order.vendor_reply && (
                  <div style={{
                    color: "#475569", fontSize: 11, marginTop: 4
                  }}>Reply: {order.vendor_reply}</div>
                )}
                {order.eta && (
                  <div style={{
                    color: "#22c55e", fontSize: 11
                  }}>ETA: {fmt(order.eta)}</div>
                )}
              </div>
              <div style={{
                display: "flex", gap: 8, alignItems: "center"
              }}>
                <span style={{
                  background: order.trigger_type === "Auto" ? "#3b82f620" : "#8b5cf620",
                  color: order.trigger_type === "Auto" ? "#3b82f6" : "#8b5cf6",
                  fontSize: 10, padding: "2px 8px", borderRadius: 4
                }}>{order.trigger_type}</span>
                <span style={{
                  background: statusColor(order.status) + "20",
                  color: statusColor(order.status), fontSize: 11,
                  padding: "3px 10px", borderRadius: 6, fontWeight: 600
                }}>{order.status}</span>
                {(order.status === "Order Placed" || order.status === "In Transit") && (
                  <button onClick={() => handleDeliveryConfirm(order)}
                    style={{
                      background: "#22c55e15", border: "1px solid #22c55e",
                      borderRadius: 6, padding: "4px 10px", color: "#22c55e",
                      fontSize: 11, cursor: "pointer"
                    }}>
                    Confirm Delivery
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
