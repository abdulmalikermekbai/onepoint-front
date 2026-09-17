/**
 * Отправка заявки на бэкенд PHP (https://api.onepoint.kz/api/lead.php)
 */
export async function submitLead(data: Record<string, any>): Promise<boolean> {
  const backendBase = process.env.NEXT_PUBLIC_API_URL || "https://api.onepoint.kz/api";
  const url = `${backendBase.replace(/\/$/, "")}/lead.php`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (e) {
    console.error("Lead submit error:", e);
    // Fallback: try local /api/lead if available
    try {
      const localRes = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return localRes.ok;
    } catch (_) {
      return false;
    }
  }
}
