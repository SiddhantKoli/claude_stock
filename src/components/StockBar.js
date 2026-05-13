export const StockBar = ({ item }) => {
  const stockPct = Math.round((item.current_stock / item.total_capacity) * 100);
  const color = stockPct <= 20 ? "#ef4444" : stockPct <= 40 ? "#f97316" : "#22c55e";
  
  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 11, color: "#9ca3af", marginBottom: 4
      }}>
        <span>{item.current_stock} {item.unit}</span>
        <span>{stockPct}%</span>
      </div>
      <div style={{
        background: "#1e293b", borderRadius: 4, height: 6, overflow: "hidden"
      }}>
        <div style={{
          width: `${stockPct}%`, height: "100%", background: color,
          borderRadius: 4, transition: "width 0.5s"
        }} />
      </div>
      <div style={{
        fontSize: 10, color: "#6b7280", marginTop: 3
      }}>Cap: {item.total_capacity} {item.unit}</div>
    </div>
  );
};
