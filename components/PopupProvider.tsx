"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import RegisterPopup from "./RegisterPopup";

type PopupContextValue = {
  openPopup: () => void;
};

const PopupContext = createContext<PopupContextValue | null>(null);

const SESSION_FLAG = "phk_popup_shown";

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup phải dùng bên trong <PopupProvider>");
  return ctx;
}

export default function PopupProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = useCallback(() => setIsOpen(true), []);
  const closePopup = useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem(SESSION_FLAG, "1");
  }, []);

  useEffect(() => {
    // Hiện ngay khi trang tải xong, trừ khi đã đóng popup trong phiên này (câu 16-17 project-brief.md)
    if (!sessionStorage.getItem(SESSION_FLAG)) {
      setIsOpen(true);
    }
  }, []);

  return (
    <PopupContext.Provider value={{ openPopup }}>
      {children}
      <RegisterPopup isOpen={isOpen} onClose={closePopup} />
    </PopupContext.Provider>
  );
}
