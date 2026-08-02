"use client";
import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface ProductInfo {
  id?: number;
  name: string;
  sku?: string;
  price?: number;
  slug?: string;
}

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductInfo | null;
}

export default function BuyModal({ isOpen, onClose, product }: BuyModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    // If they paste 7707... or 8707..., remove the leading 7/8
    if (val.length > 10 && (val.startsWith("7") || val.startsWith("8"))) {
      val = val.substring(1);
    }
    
    if (val.length === 0) {
      setPhone("");
      return;
    }

    let formatted = "+7";
    if (val.length > 0) {
      formatted += ` (${val.substring(0, 3)}`;
    }
    if (val.length >= 4) {
      formatted += `) ${val.substring(3, 6)}`;
    }
    if (val.length >= 7) {
      formatted += `-${val.substring(6, 8)}`;
    }
    if (val.length >= 9) {
      formatted += `-${val.substring(8, 10)}`;
    }
    setPhone(formatted);
  };

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("");
      setSent(false);
      setLoading(false);
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent, viaWa: boolean) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!name.trim()) {
      setErrorMsg("Укажите ваше имя");
      return;
    }
    const purePhone = phone.replace(/\D/g, "");
    if (purePhone.length < 11) {
      setErrorMsg("Введите корректный номер телефона");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          productId: product?.id,
          productName: product?.name || "Ноутбук",
          sku: product?.sku,
          price: product?.price,
          name: name.trim(),
          phone: phone.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      if (!res.ok) {
        throw new Error("Ошибка сервера при отправке");
      }

      // Track conversion
      trackEvent('generate_lead', {
        content_name: product?.name || "Ноутбук",
        content_id: product?.id,
        value: product?.price,
        currency: 'KZT',
        lead_type: viaWa ? 'whatsapp' : 'form'
      });

      if (viaWa) {
        const waText = `Здравствуйте! Хочу заказать:
Товар: ${product?.name || "Ноутбук"}
Цена: ${product?.price ? product.price.toLocaleString("ru-RU") + " ₸" : "-"}
Имя: ${name.trim()}
Телефон: ${phone.trim()}`;
        window.open(`https://wa.me/77075511979?text=${encodeURIComponent(waText)}`, "_blank");
      }
      setSent(true);
    } catch (err) {
      console.error("Failed to submit lead", err);
      setErrorMsg("Произошла ошибка при отправке. Пожалуйста, напишите нам в WhatsApp напрямую.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(13, 14, 18, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn .2s ease-out",
      }}
    >
      <div
        className="modal-box"
        style={{
          background: "#fff",
          borderRadius: 24,
          maxWidth: 460,
          width: "100%",
          padding: "32px 28px",
          position: "relative",
          boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
          transform: "scale(1)",
          animation: "slideUp .25s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "var(--surface)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-muted)",
            transition: "all .2s",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, background: "linear-gradient(135deg,#edfaf3,#d1fae5)", borderRadius: "50%", margin: "0 auto 20px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" width="36" height="36"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>Заявка успешно отправлена!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.5, marginBottom: 24 }}>
              Наш специалист свяжется с вами в течение 15 минут для уточнения деталей и оформления.
            </p>
            <button
              className="btn btn-primary"
              onClick={onClose}
              style={{ width: "100%", padding: "14px 24px", fontSize: 15, fontWeight: 700 }}
            >
              Отлично, понятно
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
                Быстрое оформление
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: 0, lineHeight: 1.2 }}>
                Оформить заявку
              </h3>
              {product && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--surface)", borderRadius: 12, fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                  <span style={{ display: "inline-flex", verticalAlign: "middle", marginRight: 6 }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></span> {product.name}
                  {product.price ? <span style={{ color: "var(--accent)", fontWeight: 800, marginLeft: 6 }}>({product.price.toLocaleString("ru-RU")} ₸)</span> : null}
                </div>
              )}
            </div>

            <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
                  Ваше имя <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Иван"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1.5px solid var(--border)",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
                  Номер телефона <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+7 (777) 000-00-00"
                  value={phone}
                  onChange={handlePhoneChange}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1.5px solid var(--border)",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {errorMsg && (
                <div style={{ color: "#c5221f", fontSize: 13.5, fontWeight: 600, background: "#fce8e6", padding: "10px 14px", borderRadius: 8 }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.4, display: "flex", alignItems: "center", gap: 6 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/></svg>
                Ваши данные под защитой.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="btn btn-green"
                  style={{
                    width: "100%",
                    padding: "16px",
                    fontSize: 16,
                    fontWeight: 800,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  {loading ? "Отправка..." : "Оформить через WhatsApp"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
