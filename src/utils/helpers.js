export const stockPct = (item) => Math.round((item.current_stock / item.total_capacity) * 100);

export const daysUntilExpiry = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const priorityColor = (p) =>
  p === "Critical" ? "#ef4444" : p === "High" ? "#f97316" : "#22c55e";

export const statusColor = (s) => ({
  "Pending": "#f97316",
  "Order Placed": "#3b82f6",
  "In Transit": "#8b5cf6",
  "Delivered": "#22c55e",
  "Rejected": "#ef4444"
}[s] || "#888");

export const expiryColor = (days) =>
  days <= 7 ? "#ef4444" : days <= 30 ? "#f97316" : "#22c55e";

export const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

export const elapsed = (d) => {
  const h = Math.floor((Date.now() - new Date(d)) / 3600000);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
};

export const simulateEmail = async (to, subject, body) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are an email system for a Military Food Inventory Management System. Generate a professional, concise military-style email for the following:

TO: ${to}
SUBJECT: ${subject}
CONTEXT: ${body}

Write the email body only (no subject line header). Keep it formal, military-style. Include relevant details, priority markers, and action items. End with "AUTHORIZED MILITARY CHANNEL — DO NOT REPLY TO THIS EMAIL DIRECTLY".`
        }]
      })
    });
    const data = await response.json();
    return data.content?.[0]?.text || "Email sent successfully.";
  } catch (e) {
    return `Email queued: ${subject}`;
  }
};
