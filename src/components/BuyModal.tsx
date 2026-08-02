"use client";
import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { formatPhoneKZ } from "@/lib/phone";

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
    setPhone(formatPhoneKZ(e.target.value));
  };

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("");
      setSent(false);
      setLoading(false);
      setErrorMsg("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Пожалуйста, укажите ваше имя");
      return;
    }

    const pureDigits = phone.replace(/\D/g, "");
    if (pureDigits.length < 11) {
      setErrorMsg("Укажите правильный номер телефона в формате +7 (7XX) XXX-XX-XX");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    trackEvent('generate_lead', {
      content_name: product?.name || 'Заявка',
      content_id: product?.id,
      value: product?.price,
      currency: 'KZT'
    });

    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order",
          productId: product?.id,
          productName: product?.name,
          sku: product?.sku,
          price: product?.price,
          name,
          phone,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      setSent(true);
    } catch (_) {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          background: "var(--bg)",
          borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          border: "1px solid var(--border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            cursor: "pointer",
          }}
          aria-label="Закрыть"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.12)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="32" height="32">
                <path d="M20 6L9 17l-5-5" />
              </svg>
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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
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
                  {loading ? (
                    <>
                      <svg style={{ animation: "spin 0.9s linear infinite" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Отправка...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Отправить заявку
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
