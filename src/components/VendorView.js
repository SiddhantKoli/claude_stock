import { useState } from "react";
import { FOOD_IMAGES, LOCATIONS, VENDORS } from "../constants/data";
import { statusColor, fmt } from "../utils/helpers";
import { inputStyle, labelStyle } from "./Modal";

export const VendorView = ({
  user, orders, items, vendorOtpState,
  setVendorOtpState, handleVendorOtp, handleVendorConfirm,
  toast
}) => {
  const [vendorEta, setVendorEta] = useState({});
  const [vendorReply, setVendorReply] = useState({});
  const myOrders = orders.filter(o => o.vendor_id === user.vendor_id);

  return (
    <div>
      <div style={{
        color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 20
      }}>VENDOR PORTAL — {user.name}</div>
      {myOrders.length === 0 ? (
        <div style={{
          color: "#334155", textAlign: "center", padding: 40
        }}>No orders assigned</div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {myOrders.map(order => {
            const item = items.find(i => i.id === order.food_item_id);
            const otpData = vendorOtpState[order.id];
            return (
              <div key={order.id} style={{
                background: "#0f172a", border: "1px solid #1e293b",
                borderRadius: 12, padding: 20
              }}>
                <div style={{
                  display: "flex", gap: 16, alignItems: "flex-start"
                }}>
                  <img
                    src={FOOD_IMAGES[item?.name] || "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=80&h=80&fit=crop"}
                    alt=""
                    style={{
                      width: 72, height: 72, borderRadius: 8, objectFit: "cover"
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      flexWrap: "wrap", gap: 8
                    }}>
                      <div style={{
                        color: "#f1f5f9", fontWeight: 700, fontSize: 16
                      }}>{item?.name}</div>
                      <span style={{
                        background: statusColor(order.status) + "20",
                        color: statusColor(order.status), fontSize: 11,
                        padding: "3px 10px", borderRadius: 6, fontWeight: 600
                      }}>{order.status}</span>
                    </div>
                    <div style={{
                      color: "#64748b", fontSize: 12, marginTop: 4
                    }}>
                      Qty: <strong style={{ color: "#f97316" }}>
                        {order.quantity_requested} {item?.unit}
                      </strong> •
                      {LOCATIONS.find(l => l.id === item?.location_id)?.name} •
                      <span style={{
                        color: item?.priority === "Critical" ? "#ef4444" : "#f97316"
                      }}> {item?.priority}</span>
                    </div>
                    <div style={{
                      color: "#475569", fontSize: 11, marginTop: 4
                    }}>Raised: {fmt(order.created_at)} • Trigger: {order.trigger_type}</div>
                  </div>
                </div>

                {order.status === "Pending" && !order.eta && (
                  <div style={{
                    marginTop: 16, borderTop: "1px solid #1e293b", paddingTop: 16
                  }}>
                    {!otpData?.sent ? (
                      <button onClick={() => handleVendorOtp(order.id)}
                        style={{
                          background: "#3b82f615", border: "1px solid #3b82f6",
                          borderRadius: 8, padding: "8px 20px", color: "#3b82f6",
                          cursor: "pointer", fontWeight: 600, fontSize: 13
                        }}>
                        📧 Send OTP to Verify Identity
                      </button>
                    ) : !otpData.verified ? (
                      <div style={{
                        display: "flex", gap: 10, alignItems: "center"
                      }}>
                        <input placeholder="Enter 6-digit OTP" style={{
                          ...inputStyle, marginBottom: 0, width: 200
                        }}
                          onChange={e => setVendorOtpState(p => ({
                            ...p, [order.id]: { ...p[order.id], entered: e.target.value }
                          }))} />
                        <button onClick={() => {
                          if (otpData.entered === otpData.otp) {
                            setVendorOtpState(p => ({
                              ...p, [order.id]: { ...p[order.id], verified: true }
                            }));
                            toast("OTP verified! You can now confirm the order.");
                          } else { toast("Invalid OTP", "error"); }
                        }} style={{
                          background: "#22c55e15", border: "1px solid #22c55e",
                          borderRadius: 8, padding: "8px 16px", color: "#22c55e",
                          cursor: "pointer", fontWeight: 600, fontSize: 13
                        }}>
                          Verify
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{
                          color: "#22c55e", fontSize: 12, marginBottom: 12
                        }}>✓ Identity Verified</div>
                        <input type="date" placeholder="Expected Delivery Date"
                          style={{ ...inputStyle, marginBottom: 10 }}
                          value={vendorEta[order.id] || ""}
                          onChange={e => setVendorEta(p => ({
                            ...p, [order.id]: e.target.value
                          }))} />
                        <textarea placeholder="Reply note (optional)"
                          style={{ ...inputStyle, height: 60, resize: "vertical" }}
                          value={vendorReply[order.id] || ""}
                          onChange={e => setVendorReply(p => ({
                            ...p, [order.id]: e.target.value
                          }))} />
                        <button onClick={() => handleVendorConfirm(
                          order, vendorEta[order.id], vendorReply[order.id] || ""
                        )} style={{
                          background: "#22c55e", border: "none", borderRadius: 8,
                          padding: "10px 24px", color: "#052e16",
                          fontWeight: 700, fontSize: 13, cursor: "pointer"
                        }}>
                          Confirm Order & Set ETA
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {order.vendor_reply && (
                  <div style={{
                    marginTop: 12, color: "#64748b", fontSize: 12
                  }}>Note: {order.vendor_reply}
                    {order.eta && ` • ETA: ${fmt(order.eta)}`}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
