"use client";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("");
      setSent(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    try {
      await fetch("/api/lead", {
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
      setSent(true);
    } catch (err) {
      console.error("Failed to submit lead", err);
      setSent(true);
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
            <div style={{ fontSize: 60, marginBottom: 16, animation: "popIn .3s ease" }}>✅</div>
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
                  💻 {product.name}
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
                  placeholder="+7 (707) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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

              <div style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.4 }}>
                🔒 Ваши данные под защитой. Нажимая кнопку, вы согласиетесь на обработку персональных данных.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: 16,
                  fontWeight: 800,
                  marginTop: 4,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Отправка заявки..." : "Отправить заявку"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
