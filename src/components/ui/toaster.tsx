"use client";

import * as React from "react";
import { Toast } from "./feedback";

/* A toast states its consequence in the client's terms, and clears itself
   after four seconds. Dismiss is always available, because a message that
   disappears on its own schedule is not a message you can re-read. */

type ToastItem = { id: number; message: React.ReactNode };

const ToastContext = React.createContext<(message: React.ReactNode) => void>(() => {});

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback(
    (message: React.ReactNode) => {
      const id = Date.now() + Math.random();
      setItems((list) => [...list, { id, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-70 flex flex-col items-center gap-2">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto max-w-[min(90vw,32rem)]">
            <Toast onDismiss={() => dismiss(t.id)}>{t.message}</Toast>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
