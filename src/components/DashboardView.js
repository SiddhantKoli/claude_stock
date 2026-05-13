import { BRANCHES, PRIORITIES, LOCATIONS, VENDORS, FOOD_IMAGES } from "../constants/data";
import { stockPct, priorityColor, daysUntilExpiry, expiryColor, fmt, elapsed, statusColor } from "../utils/helpers";

const MiniChart = ({ items }) => {
  const byBranch = BRANCHES.map(b => ({
    branch: b,
    total: items.filter(i => i.branch === b).reduce((s, i) => s + i.total_capacity, 0),
    current: items.filter(i => i.branch === b).reduce((s, i) => s + i.current_stock, 0),
  }));
  const colors = { "Navy": "#3b82f6", "Air Defence": "#8b5cf6", "Army": "#22c55e" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, padding: 20
      }}>
        <div style={{
          color: "#94a3b8", fontSize: 12, marginBottom: 16, fontWeight: 600
        }}>BRANCH STOCK HEALTH</div>
        {byBranch.map(b => (
          <div key={b.branch} style={{ marginBottom: 14 }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 12, color: "#94a3b8", marginBottom: 4
            }}>
              <span style={{ color: colors[b.branch] }}>{b.branch}</span>
              <span>
                {b.total > 0 ? Math.round((b.current / b.total) * 100) : 0}%
              </span>
            </div>
            <div style={{
              background: "#1e293b", borderRadius: 4, height: 8
            }}>
              <div style={{
                width: `${b.total > 0 ? (b.current / b.total) * 100 : 0}%`,
                height: "100%", background: colors[b.branch], borderRadius: 4
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, padding: 20
      }}>
        <div style={{
          color: "#94a3b8", fontSize: 12, marginBottom: 16, fontWeight: 600
        }}>STOCK BY PRIORITY</div>
        {PRIORITIES.map(p => {
          const pitems = items.filter(i => i.priority === p);
          const low = pitems.filter(i => stockPct(i) <= 20).length;
          return (
            <div key={p} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 10
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: priorityColor(p)
                }} />
                <span style={{
                  color: "#94a3b8", fontSize: 12
                }}>{p}</span>
              </div>
              <div style={{
                display: "flex", gap: 12, fontSize: 12
              }}>
                <span style={{ color: "#64748b" }}>{pitems.length} items</span>
                {low > 0 && <span style={{ color: "#ef4444" }}>{low} low</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DashboardView = ({
  items, orders, user, onManualOrder, onDeliveryConfirm
}) => {
  const lowStockItems = items.filter(i => {
    const t = i.priority === "Critical" ? 30 : 20;
    return stockPct(i) <= t;
  });
  const expiringItems = items.filter(i => daysUntilExpiry(i.expiry_date) <= 30);
  const pendingOrders = orders.filter(o =>
    o.status === "Pending" || o.status === "Order Placed"
  );

  return (
    <div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16, marginBottom: 24
      }}>
        {[
          { label: "Total Items", value: items.length, color: "#3b82f6", icon: "📦" },
          { label: "Critical Low", value: lowStockItems.filter(i => i.priority === "Critical").length, color: "#ef4444", icon: "🚨" },
          { label: "Pending Orders", value: pendingOrders.length, color: "#f97316", icon: "📋" },
          { label: "Expiring Soon", value: expiringItems.length, color: "#eab308", icon: "⏰" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#0f172a", border: `1px solid ${s.color}30`,
            borderRadius: 12, padding: 20
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start"
            }}>
              <div>
                <div style={{
                  color: "#64748b", fontSize: 11, fontWeight: 600
                }}>{s.label}</div>
                <div style={{
                  color: s.color, fontSize: 32, fontWeight: 700, marginTop: 4
                }}>{s.value}</div>
              </div>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <MiniChart items={items} />

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 20, marginTop: 20
      }}>
        <div style={{
          background: "#0f172a", border: "1px solid #ef444430",
          borderRadius: 12, padding: 20
        }}>
          <div style={{
            color: "#ef4444", fontSize: 12, fontWeight: 600, marginBottom: 16
          }}>⚠ CRITICAL LOW STOCK</div>
          {lowStockItems.length === 0 ? (
            <div style={{ color: "#334155", fontSize: 13 }}>
              All items adequately stocked
            </div>
          ) : (
            lowStockItems.slice(0, 5).map(item => (
              <div key={item.id} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 10,
                paddingBottom: 10, borderBottom: "1px solid #1e293b"
              }}>
                <div>
                  <div style={{
                    color: "#f1f5f9", fontSize: 13, fontWeight: 600
                  }}>{item.name}</div>
                  <div style={{
                    color: "#64748b", fontSize: 11
                  }}>{item.branch} • {stockPct(item)}%</div>
                </div>
                <button onClick={() => onManualOrder(item)} style={{
                  background: "#ef444415", border: "1px solid #ef4444",
                  borderRadius: 6, padding: "4px 10px", color: "#ef4444",
                  fontSize: 11, cursor: "pointer"
                }}>
                  Order Now
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{
          background: "#0f172a", border: "1px solid #f9731630",
          borderRadius: 12, padding: 20
        }}>
          <div style={{
            color: "#f97316", fontSize: 12, fontWeight: 600, marginBottom: 16
          }}>⏰ EXPIRING SOON</div>
          {expiringItems.length === 0 ? (
            <div style={{ color: "#334155", fontSize: 13 }}>
              No items expiring soon
            </div>
          ) : (
            expiringItems.slice(0, 5).map(item => {
              const days = daysUntilExpiry(item.expiry_date);
              return (
                <div key={item.id} style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 10,
                  paddingBottom: 10, borderBottom: "1px solid #1e293b"
                }}>
                  <div>
                    <div style={{
                      color: "#f1f5f9", fontSize: 13, fontWeight: 600
                    }}>{item.name}</div>
                    <div style={{
                      color: "#64748b", fontSize: 11
                    }}>{item.branch} • {fmt(item.expiry_date)}</div>
                  </div>
                  <span style={{
                    color: expiryColor(days), fontSize: 12, fontWeight: 700
                  }}>{days}d</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 12, padding: 20, marginTop: 20
      }}>
        <div style={{
          color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 16
        }}>📋 PENDING ORDERS TRACKER</div>
        {pendingOrders.length === 0 ? (
          <div style={{ color: "#334155", fontSize: 13 }}>
            No pending orders
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {pendingOrders.map(order => {
              const item = items.find(i => i.id === order.food_item_id);
              const vendor = VENDORS.find(v => v.id === order.vendor_id);
              const hrs = Math.floor((Date.now() - new Date(order.created_at)) / 3600000);
              return (
                <div key={order.id} style={{
                  background: "#0a0f1e", border: `1px solid ${hrs > 48 ? "#ef444440" : "#1e293b"}`,
                  borderRadius: 8, padding: 14, display: "flex",
                  alignItems: "center", gap: 16
                }}>
                  <img
                    src={FOOD_IMAGES[item?.name] || "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=60&h=60&fit=crop"}
                    alt="" style={{
                      width: 48, height: 48, borderRadius: 8, objectFit: "cover"
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex", gap: 8, alignItems: "center"
                    }}>
                      <span style={{
                        color: "#f1f5f9", fontWeight: 700, fontSize: 14
                      }}>{item?.name}</span>
                      <span style={{
                        background: priorityColor(item?.priority) + "20",
                        color: priorityColor(item?.priority), fontSize: 10,
                        padding: "2px 6px", borderRadius: 4
                      }}>{item?.priority}</span>
                      <span style={{
                        background: order.trigger_type === "Auto" ? "#3b82f620" : "#8b5cf620",
                        color: order.trigger_type === "Auto" ? "#3b82f6" : "#8b5cf6",
                        fontSize: 10, padding: "2px 6px", borderRadius: 4
                      }}>{order.trigger_type}</span>
                    </div>
                    <div style={{
                      color: "#64748b", fontSize: 12, marginTop: 4
                    }}>
                      {vendor?.name} • Qty: {order.quantity_requested} • {elapsed(order.created_at)}
                    </div>
                  </div>
                  <div style={{
                    display: "flex", gap: 8, alignItems: "center"
                  }}>
                    <span style={{
                      background: statusColor(order.status) + "20",
                      color: statusColor(order.status), fontSize: 11,
                      padding: "3px 10px", borderRadius: 6, fontWeight: 600
                    }}>{order.status}</span>
                    {order.status === "Order Placed" && (
                      <button onClick={() => onDeliveryConfirm(order)} style={{
                        background: "#22c55e15", border: "1px solid #22c55e",
                        borderRadius: 6, padding: "4px 10px", color: "#22c55e",
                        fontSize: 11, cursor: "pointer"
                      }}>
                        Confirm Delivery
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
