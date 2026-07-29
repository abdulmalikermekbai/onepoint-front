"use client";
import { useState, useCallback, createContext, useContext, useRef } from "react";

interface ToastContextType {
  showToast: (msg: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ToastContext = createContext<ToastContextType>({ showToast: (() => {}) as any });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setMsg(message);
    setShow(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(false), 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast${show ? " show" : ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#FF8A50" strokeWidth="2.4" width="16" height="16">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        {msg}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
